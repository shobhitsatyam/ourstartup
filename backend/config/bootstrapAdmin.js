import User from '../models/User.js';
import { isMongoConnected } from './db.js';

/**
 * Secure Production Admin Bootstrap
 * Runs after successful MongoDB connection to ensure the administrator account
 * defined in environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME)
 * exists with the 'admin' role, securely hashed via the User model.
 */
export const bootstrapAdmin = async () => {
  if (!isMongoConnected) {
    return;
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim()?.toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME?.trim() || 'Ocean Jewel Admin';

    if (!adminEmail || !adminPassword) {
      return;
    }

    // Find the user by ADMIN_EMAIL
    const existingUser = await User.findOne({ email: adminEmail }).select('+password');

    if (!existingUser) {
      // Create admin user using the User model (password hashed automatically via userSchema.pre('save'))
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        phone: '+91 9876543210',
        role: 'admin',
        oceanPoints: 1000,
        isVerified: true,
      });

      console.log('[Ocean Jewel] Admin account verified/created');
    } else {
      let needsSave = false;

      // Ensure user has admin role
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        needsSave = true;
      }

      // Do NOT overwrite password on every startup if it already matches
      const isMatch = await existingUser.matchPassword(adminPassword);
      if (!isMatch) {
        existingUser.password = adminPassword;
        needsSave = true;
      }

      if (needsSave) {
        await existingUser.save();
      }

      console.log('[Ocean Jewel] Admin account verified/created');
    }
  } catch (error) {
    console.error('❌ [Ocean Jewel] Error during admin bootstrap:', error.message);
  }
};
