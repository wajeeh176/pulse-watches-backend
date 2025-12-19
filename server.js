const app = require('./app');
const mongoose = require('mongoose');
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
  // Connection options for MongoDB
  const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4 // Use IPv4, skip trying IPv6
  };

  // Connect to MongoDB with optimized settings
  mongoose.connect(process.env.MONGO_URI, mongoOptions)
    .then(() => {
      console.log('MongoDB connected successfully');
      
      // Start server
      const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} - Worker ${process.pid}`);
      });
      
      // Optimize HTTP server
      server.keepAliveTimeout = 65000; // Ensure keep-alive connections stay alive
      server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout
      
      // Handle graceful shutdown
      process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
          console.log('HTTP server closed');
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
}
