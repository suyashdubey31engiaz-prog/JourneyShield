import User from '../models/userModel.js';
import OTP from '../models/otpModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dns from 'dns';

// FIX: Force Node.js to use standard IPv4 to prevent the ENETUNREACH IPv6 error
dns.setDefaultResultOrder('ipv4first');

// --- EMAIL TRANSPORTER SETUP ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_key', { expiresIn: '30d' });
};

// ... keep all the rest of your controller functions exactly the same below this!

// --- STEP 1: GENERATE & SEND OTP ---
export const sendRegistrationOTP = async (req, res) => {
  try {
    const { email, username } = req.body;

    // 1. Check if user already exists before wasting an email
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // 2. Generate a 6-digit random number
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save it to our temporary OTP database (will auto-delete in 5 mins)
    await OTP.findOneAndDelete({ email }); // Delete any old OTPs for this email first
    await OTP.create({ email, otp: generatedOtp });

    // 4. Send the email
    const mailOptions = {
      from: `"JourneyShield Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your JourneyShield Verification Code',
      text: `Welcome to JourneyShield! Your 6-digit verification code is: ${generatedOtp}. This code will expire in 5 minutes.`,
      html: `<h2>Welcome to JourneyShield!</h2><p>Your verification code is: <b style="font-size: 24px;">${generatedOtp}</b></p><p>This code will expire in 5 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully to your email' });

  } catch (error) {
    console.error("OTP Error: ", error);
    res.status(500).json({ message: 'Failed to send OTP email. Please check your email configuration.' });
  }
};

// --- STEP 2: VERIFY OTP & CREATE USER ---
export const verifyAndRegister = async (req, res) => {
  try {
    const { fullName, username, email, password, role, otp } = req.body;

    // 1. Verify the OTP
    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // 2. Create the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: fullName,
      username: username,
      email: email,
      password: hashedPassword,
      role: role || 'Traveler', 
    });

    // 3. Clean up the used OTP
    await OTP.findOneAndDelete({ email });

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

// --- LOGIN & GET GUIDES (Unchanged) ---
export const loginUser = async (req, res) => {
  try {
    const { identifier, password, selectedRole } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Please provide email/username and password' });

    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.role !== 'Both' && user.role !== selectedRole) {
        return res.status(403).json({ message: `Access denied. You do not have an account as a ${selectedRole}.` });
      }

      res.status(200).json({
        _id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role === 'Both' ? selectedRole : user.role, 
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email/username or password' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getGuides = async (req, res) => {
  try {
    const guides = await User.find({ role: { $in: ['Guide', 'Both'] } }).select('-password');
    res.status(200).json(guides);
  } catch (error) { res.status(500).json({ message: error.message }); }
};