import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_key', { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password, role } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

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
      role: role || 'Traveler', // Will now accept 'Traveler', 'Guide', or 'Both'
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

export const loginUser = async (req, res) => {
  try {
    // FIX: We now capture 'selectedRole' from the frontend login tabs
    const { identifier, password, selectedRole } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password' });
    }

    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });

    if (user && (await bcrypt.compare(password, user.password))) {
      
      // STRICT CHECK: Does their DB role match the tab they clicked?
      if (user.role !== 'Both' && user.role !== selectedRole) {
        return res.status(403).json({ message: `Access denied. You do not have an account as a ${selectedRole}.` });
      }

      res.status(200).json({
        _id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        // If they are 'Both', set their session role to whichever tab they clicked!
        role: user.role === 'Both' ? selectedRole : user.role, 
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email/username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

export const getGuides = async (req, res) => {
  try {
    // We now find users who are 'Guide' OR 'Both'
    const guides = await User.find({ role: { $in: ['Guide', 'Both'] } }).select('-password');
    res.status(200).json(guides);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching guides' });
  }
};