import mongoose from 'mongoose';
import { env } from './env';

let mongoClient: mongoose.mongo.MongoClient;

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
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