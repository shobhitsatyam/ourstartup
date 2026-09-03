import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Address from '../models/Address.js';
import RewardTransaction from '../models/RewardTransaction.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (isMongoConnected) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const welcomeBonus = 50;
      const user = await User.create({
        name,
        email,
        phone: phone || '',
        password,
        oceanPoints: welcomeBonus,
        role: 'user',
      });

      await RewardTransaction.create({
        user: user._id,
        points: welcomeBonus,
        type: 'BONUS',
        description: 'Welcome to Ocean Jewel! New Member Bonus',
        balanceAfter: welcomeBonus,
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          oceanPoints: user.oceanPoints,
          token,
        },
        message: 'Account created successfully! You received 50 Ocean Points as a welcome gift.',
      });
    } else {
      // MockStore register
      const userExists = mockStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const welcomeBonus = 50;
      const newUser = {
        _id: `user_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        password: hashedPassword,
        role: 'user',
        oceanPoints: welcomeBonus,
        createdAt: new Date().toISOString(),
      };

      mockStore.users.push(newUser);
      mockStore.rewardTransactions.push({
        _id: `rew_${Date.now()}`,
        user: newUser._id,
        points: welcomeBonus,
        type: 'BONUS',
        description: 'Welcome to Ocean Jewel! New Member Bonus',
        balanceAfter: welcomeBonus,
        createdAt: new Date().toISOString(),
      });

      const token = generateToken(newUser._id);
      return res.status(201).json({
        success: true,
        data: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          oceanPoints: newUser.oceanPoints,
          token,
        },
        message: 'Account created successfully! You received 50 Ocean Points as a welcome gift.',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password' });
    }

    if (isMongoConnected) {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          oceanPoints: user.oceanPoints,
          avatar: user.avatar,
          token,
        },
      });
    } else {
      const user = mockStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);
      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          oceanPoints: user.oceanPoints,
          avatar: user.avatar || '',
          token,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    if (isMongoConnected) {
      const user = await User.findById(req.user._id);
      const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });

      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          oceanPoints: user.oceanPoints,
          avatar: user.avatar,
          addresses,
        },
      });
    } else {
      const user = mockStore.users.find((u) => u._id.toString() === req.user._id.toString());
      const addresses = mockStore.addresses.filter((a) => a.user.toString() === req.user._id.toString());

      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          oceanPoints: user.oceanPoints,
          avatar: user.avatar || '',
          addresses,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (isMongoConnected) {
      const user = await User.findById(req.user._id).select('+password');
      if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
        if (req.body.avatar) user.avatar = req.body.avatar;
        if (req.body.password) user.password = req.body.password;

        const updatedUser = await user.save();
        return res.json({
          success: true,
          data: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            oceanPoints: updatedUser.oceanPoints,
            avatar: updatedUser.avatar,
          },
          message: 'Profile updated successfully',
        });
      }
    } else {
      const user = mockStore.users.find((u) => u._id.toString() === req.user._id.toString());
      if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
        if (req.body.avatar) user.avatar = req.body.avatar;
        if (req.body.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(req.body.password, salt);
        }

        return res.json({
          success: true,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            oceanPoints: user.oceanPoints,
            avatar: user.avatar || '',
          },
          message: 'Profile updated successfully',
        });
      }
    }
    res.status(404).json({ success: false, message: 'User not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserAddresses = async (req, res) => {
  try {
    if (isMongoConnected) {
      const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
      return res.json({ success: true, data: addresses });
    } else {
      const addresses = mockStore.addresses.filter((a) => a.user.toString() === req.user._id.toString());
      return res.json({ success: true, data: addresses });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { fullName, phone, house, street, area, city, state, pincode, landmark, addressType, isDefault } = req.body;

    if (isMongoConnected) {
      if (isDefault) {
        await Address.updateMany({ user: req.user._id }, { isDefault: false });
      }
      const count = await Address.countDocuments({ user: req.user._id });
      const address = await Address.create({
        user: req.user._id,
        fullName,
        phone,
        house,
        street,
        area: area || '',
        city,
        state,
        pincode,
        landmark: landmark || '',
        addressType: addressType || 'HOME',
        isDefault: isDefault || count === 0,
      });
      return res.status(201).json({ success: true, data: address, message: 'Address saved successfully' });
    } else {
      if (isDefault) {
        mockStore.addresses.forEach((a) => {
          if (a.user.toString() === req.user._id.toString()) a.isDefault = false;
        });
      }
      const userAddrs = mockStore.addresses.filter((a) => a.user.toString() === req.user._id.toString());
      const newAddr = {
        _id: `addr_${Date.now()}`,
        user: req.user._id,
        fullName,
        phone,
        house,
        street,
        area: area || '',
        city,
        state,
        pincode,
        landmark: landmark || '',
        addressType: addressType || 'HOME',
        isDefault: isDefault || userAddrs.length === 0,
        createdAt: new Date().toISOString(),
      };
      mockStore.addresses.push(newAddr);
      return res.status(201).json({ success: true, data: newAddr, message: 'Address saved successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    if (isMongoConnected) {
      const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
      if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
      if (req.body.isDefault) {
        await Address.updateMany({ user: req.user._id }, { isDefault: false });
      }
      Object.assign(address, req.body);
      await address.save();
      return res.json({ success: true, data: address, message: 'Address updated successfully' });
    } else {
      const address = mockStore.addresses.find((a) => a._id.toString() === req.params.id && a.user.toString() === req.user._id.toString());
      if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
      if (req.body.isDefault) {
        mockStore.addresses.forEach((a) => {
          if (a.user.toString() === req.user._id.toString()) a.isDefault = false;
        });
      }
      Object.assign(address, req.body);
      return res.json({ success: true, data: address, message: 'Address updated successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    if (isMongoConnected) {
      const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
      return res.json({ success: true, message: 'Address deleted successfully' });
    } else {
      const index = mockStore.addresses.findIndex((a) => a._id.toString() === req.params.id && a.user.toString() === req.user._id.toString());
      if (index === -1) return res.status(404).json({ success: false, message: 'Address not found' });
      mockStore.addresses.splice(index, 1);
      return res.json({ success: true, message: 'Address deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
