import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';

let mongoClient: mongoose.mongo.MongoClient;
let memoryServer: MongoMemoryServer | null = null;

const connectDB = async (): Promise<void> => {
  try {
    // Try connecting to configured URI first
    let uri = env.MONGO_URI;
    let conn: mongoose.Mongoose;

    try {
      conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.log('Primary MongoDB unavailable, starting in-memory MongoDB...');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      conn = await mongoose.connect(uri);
      console.log(`In-memory MongoDB Connected: ${conn.connection.host}`);
    }

    // Store the native MongoDB client for better-auth
    mongoClient = conn.connection.getClient();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Get native MongoDB client/db for better-auth adapter
export const getMongoClient = (): mongoose.mongo.MongoClient => {
  if (!mongoClient) {
    throw new Error('MongoDB client not initialized. Call connectDB first.');
  }
  return mongoClient;
};

export const getMongoDb = (): mongoose.mongo.Db => {
  if (!mongoClient) {
    throw new Error('MongoDB client not initialized. Call connectDB first.');
  }
  return mongoClient.db();
};

export default connectDB;
