import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

// Environment Validation
const validateEnvironment = () => {
  const missing = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    missing.push('JWT_SECRET');
  }
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.trim() === '') {
    missing.push('MONGODB_URI');
  }
  if (!process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL.trim() === '') {
    missing.push('ADMIN_EMAIL');
  }
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.trim() === '') {
    missing.push('ADMIN_PASSWORD');
  }

  if (missing.length > 0) {
    console.error(`
❌ =======================================================
❌  FATAL CONFIGURATION ERROR: MISSING REQUIRED SECRETS
❌ =======================================================
❌ The following environment variable(s) must be defined:
${missing.map((key) => `❌  - ${key}`).join('\n')}
❌
❌ Please configure them in backend/.env before starting.
❌ See backend/.env.example for guidance.
❌ =======================================================
    `);
    process.exit(1);
  }
};

validateEnvironment();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check / API status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'Ocean Jewel — Luxury Indian Jewellery',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server immediately & connect to DB asynchronously in background
app.listen(PORT, () => {
  console.log(`
💎 =======================================================
💎  OCEAN JEWEL — LUXURY JEWELLERY API SERVER
💎  Listening on http://localhost:${PORT}
💎  Brand Theme: #D6CFFF | Pure Pearl & Frosted Lavender
💎 =======================================================
  `);
  // Asynchronous MongoDB connection attempt
  connectDB().catch((err) => console.log('DB connect err:', err.message));
});
