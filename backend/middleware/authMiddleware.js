import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      let user;
      if (isMongoConnected) {
        user = await User.findById(decoded.id).select('-password');
      } else {
        user = mockStore.users.find((u) => u._id.toString() === decoded.id.toString());
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth middleware token verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      let user;
      if (isMongoConnected) {
        user = await User.findById(decoded.id).select('-password');
      } else {
        user = mockStore.users.find((u) => u._id.toString() === decoded.id.toString());
      }

      if (user) {
        req.user = user;
      }
    } catch (e) {
      // Ignore invalid token and continue as guest
    }
  }

  next();
};
