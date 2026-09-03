import mongoose from 'mongoose';

export let isMongoConnected = false;

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oceanjewel';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✨ [Ocean Jewel Database] MongoDB Connected: ${conn.connection.host}`);
    isMongoConnected = true;
    return true;
  } catch (error) {
    console.warn(`⚠️ [Ocean Jewel Database] Local MongoDB offline. Active fallback: Embedded Memory Store with full Seed Catalog.`);
    isMongoConnected = false;
    return false;
  }
};
