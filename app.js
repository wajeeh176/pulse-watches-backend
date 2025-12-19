const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const helmet = require('helmet');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
const app = express();

// CORS configuration - MUST come before routes
// In development, allow all localhost origins; in production, use CLIENT_URL
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development mode, allow any localhost origin
    if (process.env.NODE_ENV !== 'production') {
      if (origin.match(/^http:\/\/localhost:\d+$/) || origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
        console.log('CORS: Allowing origin in development:', origin);
        return callback(null, true);
      }
    }
    
    // In production, check against allowed origins
    const defaultOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://pulse-watches.netlify.app',
      'https://pulsewatches.pk' // Add your custom domain if you have one
    ];
    
    const allowedOrigins = process.env.CLIENT_URL 
      ? [...process.env.CLIENT_URL.split(',').map(url => url.trim()), ...defaultOrigins]
      : defaultOrigins;
    
    // Remove duplicates
    const uniqueOrigins = [...new Set(allowedOrigins)];
    
    if (uniqueOrigins.includes(origin)) {
      console.log('CORS: Allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', uniqueOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log('HTTP', req.method, req.originalUrl);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers - configure Helmet to allow API access
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API server
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression middleware
app.use(compression());

// Test products endpoint - simple version to debug (before main routes)
app.get('/api/products/test', async (req, res) => {
  try {
    const { ensureConnection } = require('./config/db');
    const Product = require('./models/Product');
    
    // Ensure connection is established
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        error: 'Database connection unavailable',
        readyState: require('mongoose').connection.readyState
      });
    }
    
    const count = await Product.countDocuments();
    const sample = await Product.findOne().lean();
    
    res.json({
      success: true,
      database: 'connected',
      productCount: count,
      sampleProduct: sample || null
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      error: error.message,
      name: error.name,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// API Routes - must come before static files
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: dbStatus === 1 ? 'ok' : 'degraded',
    message: 'Server is running',
    database: {
      status: dbStates[dbStatus] || 'unknown',
      readyState: dbStatus
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found', path: req.path });
});

// Cache control for static assets
const cacheTime = 86400000 * 30; // 30 days
app.use(express.static('public', {
  maxAge: cacheTime
}));

app.use(errorHandler);

module.exports = app;
