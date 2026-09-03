import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Ensure Node can resolve SRV records for MongoDB Atlas on Windows/restricted DNS
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore DNS override errors if not permitted
}

export let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.error('❌ [Ocean Jewel Database] Error: MONGODB_URI is not defined in environment variables.');
    isMongoConnected = false;
    process.exit(1);
  }

  const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    const host = conn.connection.host || 'unknown-host';

    if (!isLocal) {
      console.log(`[Ocean Jewel Database] MongoDB Atlas Connected: ${host}`);
    } else {
      console.log(`[Ocean Jewel Database] MongoDB Connected: ${host}`);
    }

    isMongoConnected = true;
    return conn;
  } catch (error) {
    isMongoConnected = false;

    if (isLocal) {
      console.error(`❌ [Ocean Jewel Database] Local MongoDB offline: ${error.name} - ${error.message}`);
    } else {
      console.error(`❌ [Ocean Jewel Database] MongoDB Connection Failed: ${error.name} - ${error.message}`);
    }

    process.exit(1);
  }
};

