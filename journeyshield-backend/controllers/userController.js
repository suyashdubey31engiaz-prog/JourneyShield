import User from '../models/userModel.js';
import Guide from '../models/guideModel.js'; // 1. Import the Guide model
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const registerUser = async (req, res) => {
  const { name, username, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email or username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role,
    });

    // 2. If the new user is a Guide, create a guide profile for them
    if (user && user.role === 'Guide') {
      await Guide.create({
        user: user._id,
        location: 'Not specified', // Guide will update this later
        bio: 'No bio provided yet.', // Guide will update this later
      });
    }

    if (user) {
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { loginIdentifier, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email: loginIdentifier }, { username: loginIdentifier }] });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(401);
      throw new Error('Invalid email/username or password');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

export { registerUser, loginUser };