import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
export const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password, role } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Check if user exists by email OR username
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: fullName,
      username: username,
      email: email,
      password: hashedPassword,
      role: role === 'Guide' ? 'Guide' : 'Traveler', 
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Database error during registration' });
  }
};

// @desc    Login user
export const loginUser = async (req, res) => {
  try {
    // We expect 'identifier' from the frontend, which can be email OR username
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password' });
    }

    // Search for the identifier in BOTH columns
    const user = await User.findOne({ 
      $or: [
        { email: identifier }, 
        { username: identifier }
      ] 
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        _id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email/username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get all Guides
export const getGuides = async (req, res) => {
  try {
    const guides = await User.find({ role: 'Guide' }).select('-password');
    res.status(200).json(guides);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching guides' });
  }
};