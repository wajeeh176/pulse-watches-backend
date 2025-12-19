const app = require('./app');
const { connectDB } = require('./config/db');
const cluster = require('cluster');
const os = require('os');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const numCPUs = os.cpus().length;

// Optimize for production
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
  console.log(`Master ${process.pid} is running`);

  // Fork workers based on CPU cores
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Replace the dead worker
    cluster.fork();
  });
} else {
  // Connect to MongoDB (will be lazy-loaded on serverless)
  // For traditional servers, connect immediately
  if (process.env.VERCEL !== '1') {
    connectDB()
      .then(() => {
        console.log('MongoDB pre-connected for traditional server');
        
        // Start server
        const server = app.listen(PORT, () => {
          console.log(`Server running on port ${PORT} - Worker ${process.pid}`);
        });
        
        // Optimize HTTP server
        server.keepAliveTimeout = 65000;
        server.headersTimeout = 66000;
        
        // Handle graceful shutdown
        process.on('SIGTERM', () => {
          console.log('SIGTERM signal received: closing HTTP server');
          server.close(() => {
            console.log('HTTP server closed');
            const mongoose = require('mongoose');
            mongoose.connection.close(false, () => {
              console.log('MongoDB connection closed');
              process.exit(0);
            });
          });
        });
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
      });
  } else {
    // On Vercel/serverless, just start the server
    // Connection will be established on first request
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (serverless mode)`);
    });
  }
}
