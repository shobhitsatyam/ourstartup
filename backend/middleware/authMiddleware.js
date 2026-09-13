import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';
import { verifyFirebaseToken } from '../config/firebaseAdmin.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // 1. Verify standard Application JWT (Used for Admin and customer session tokens)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user;
        if (isMongoConnected) {
          user = await User.findById(decoded.id).select('-password');
        } else {
          user = mockStore.users.find((u) => u._id.toString() === decoded.id.toString());
        }

        if (user) {
          req.user = user;
          return next();
        }
      } catch (jwtErr) {
        // Not a standard application JWT; proceed to verify as Firebase ID token
      }

      // 2. Verify as Firebase ID token via Firebase Admin SDK
      try {
        const decodedFirebase = await verifyFirebaseToken(token);
        if (decodedFirebase && decodedFirebase.uid) {
          const email = (decodedFirebase.email || '').toLowerCase().trim();
          let user;
          if (isMongoConnected) {
            user = await User.findOne({
              $or: [{ firebaseUid: decodedFirebase.uid }, { email }],
            }).select('-password');
          } else {
            user = mockStore.users.find(
              (u) => u.firebaseUid === decodedFirebase.uid || (email && u.email.toLowerCase() === email)
            );
          }

          if (user) {
            req.user = user;
            return next();
          }
        }
      } catch (fbErr) {
        // Firebase verification also failed
      }

      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    } catch (error) {
      console.error('Auth middleware token verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token verification failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no bearer token provided' });
  }
};

// Optional protect: attaches user if token present, otherwise proceeds as guest
export const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 1. Try application JWT
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user;
        if (isMongoConnected) {
          user = await User.findById(decoded.id).select('-password');
        } else {
          user = mockStore.users.find((u) => u._id.toString() === decoded.id.toString());
        }
        if (user) {
          req.user = user;
          return next();
        }
      } catch (e) {}

      // 2. Try Firebase ID token
      try {
        const decodedFirebase = await verifyFirebaseToken(token);
        if (decodedFirebase && decodedFirebase.uid) {
          const email = (decodedFirebase.email || '').toLowerCase().trim();
          let user;
          if (isMongoConnected) {
            user = await User.findOne({
              $or: [{ firebaseUid: decodedFirebase.uid }, { email }],
            }).select('-password');
          } else {
            user = mockStore.users.find(
              (u) => u.firebaseUid === decodedFirebase.uid || (email && u.email.toLowerCase() === email)
            );
          }
          if (user) {
            req.user = user;
            return next();
          }
        }
      } catch (e) {}
    } catch (e) {
      // Ignore invalid token and continue as guest
    }
  }

  next();
};
