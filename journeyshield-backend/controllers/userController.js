import User   from '../models/userModel.js';
import Guide  from '../models/guideModel.js';
import OTP    from '../models/otpModel.js';
import jwt    from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dns    from 'dns';

dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_key', { expiresIn: '30d' });

// ── SEND OTP ──────────────────────────────────────────────────────────────────
export const sendRegistrationOTP = async (req, res) => {
  try {
    const { email, username } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) return res.status(400).json({ message: 'User with this email or username already exists' });

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndDelete({ email });
    await OTP.create({ email, otp: generatedOtp });

    await transporter.sendMail({
      from: `"JourneyShield Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your JourneyShield Verification Code',
      html: `<h2>Welcome to JourneyShield!</h2><p>Code: <b style="font-size:24px">${generatedOtp}</b></p><p>Expires in 5 minutes.</p>`,
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP email.' });
  }
};

// ── VERIFY OTP & REGISTER ─────────────────────────────────────────────────────
// FIX: now auto-creates a Guide profile doc when role is Guide or Both
export const verifyAndRegister = async (req, res) => {
  try {
    const { fullName, username, email, password, role, otp } = req.body;

    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const user = await User.create({ name: fullName, username, email, password: hashedPassword, role: role || 'Traveler' });

    // Create Guide profile so reviewController can find it later
    if (role === 'Guide' || role === 'Both') {
      await Guide.create({ user: user._id, location: '', bio: '' });
    }

    await OTP.findOneAndDelete({ email });

    res.status(201).json({
      _id: user.id, name: user.name, username: user.username,
      email: user.email, role: user.role, token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration error' });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { identifier, password, selectedRole } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Please provide email/username and password' });

    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid email/username or password' });

    if (user.role !== 'Both' && user.role !== selectedRole)
      return res.status(403).json({ message: `Access denied. You do not have an account as a ${selectedRole}.` });

    const activeRole = user.role === 'Both' ? selectedRole : user.role;

    // Ensure Guide profile exists for legacy accounts that registered before this fix
    if (activeRole === 'Guide') {
      const exists = await Guide.findOne({ user: user._id });
      if (!exists) await Guide.create({ user: user._id, location: '', bio: '' });
    }

    res.status(200).json({
      _id: user.id, name: user.name, username: user.username,
      email: user.email, role: activeRole, token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL GUIDES ────────────────────────────────────────────────────────────
export const getGuides = async (req, res) => {
  try {
    const guides = await User.find({ role: { $in: ['Guide', 'Both'] } }).select('-password');
    res.status(200).json(guides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET TRAVELER PROFILE  GET /api/users/profile ─────────────────────────────
export const getTravelerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// ── UPDATE TRAVELER PROFILE  PUT /api/users/profile ──────────────────────────
export const updateTravelerProfile = async (req, res) => {
  try {
    const {
      homeCity, bio, travelStyle, interests, languages,
      phone, medicalNotes, emergencyContact, socialLinks,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (homeCity     !== undefined) user.homeCity     = homeCity;
    if (bio          !== undefined) user.bio          = bio;
    if (travelStyle  !== undefined) user.travelStyle  = travelStyle;
    if (phone        !== undefined) user.phone        = phone;
    if (medicalNotes !== undefined) user.medicalNotes = medicalNotes;
    if (Array.isArray(interests))   user.interests    = interests;
    if (Array.isArray(languages))   user.languages    = languages;

    if (emergencyContact) {
      user.emergencyContact = {
        name:     emergencyContact.name     ?? user.emergencyContact?.name     ?? '',
        phone:    emergencyContact.phone    ?? user.emergencyContact?.phone    ?? '',
        relation: emergencyContact.relation ?? user.emergencyContact?.relation ?? '',
      };
    }
    if (socialLinks) {
      user.socialLinks = {
        instagram: socialLinks.instagram ?? user.socialLinks?.instagram ?? '',
        facebook:  socialLinks.facebook  ?? user.socialLinks?.facebook  ?? '',
        website:   socialLinks.website   ?? user.socialLinks?.website   ?? '',
      };
    }

    const updated = await user.save();
    const { password: _, ...userData } = updated.toObject();
    res.json(userData);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};