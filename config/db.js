const mongoose = require('mongoose');

let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Start new connection
  connectionPromise = mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // Increased to 10s for serverless
    socketTimeoutMS: 45000,
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 1, // Maintain at least 1 socket connection
    bufferMaxEntries: 0, // Disable mongoose buffering
    bufferCommands: false, // Disable mongoose buffering
    family: 4 // Use IPv4
  })
    .then(() => {
      console.log('MongoDB connected successfully');
      isConnected = true;
      connectionPromise = null;
      return mongoose.connection;
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      connectionPromise = null;
      isConnected = false;
      throw error;
    });

  return connectionPromise;
};

// Ensure connection before operations
const ensureConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  
  try {
    await connectDB();
    return true;
  } catch (error) {
    console.error('Failed to ensure MongoDB connection:', error);
    return false;
  }
};

module.exports = { connectDB, ensureConnection, mongoose };

