import User  from '../models/userModel.js';
import Guide from '../models/guideModel.js';
import OTP   from '../models/otpModel.js';
import jwt        from 'jsonwebtoken';
import bcrypt     from 'bcryptjs';
import SibApiV3Sdk from '@getbrevo/brevo';

// Brevo HTTP API — uses port 443 (HTTPS), never blocked on any cloud host
const brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
brevoClient.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_key', { expiresIn: '30d' });

// ── Step 1: send OTP ───────────────────────────────────────────────────────────
export const sendRegistrationOTP = async (req, res) => {
  try {
    const { email, username } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) return res.status(400).json({ message: 'User with this email or username already exists' });

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndDelete({ email });
    await OTP.create({ email, otp: generatedOtp });

    console.log('[OTP] Attempting to send email to:', email);
    console.log('[OTP] BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'SET' : 'NOT SET');

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = 'Your JourneyShield Verification Code';
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.sender = { name: 'JourneyShield', email: process.env.BREVO_SMTP_USER || 'noreply@journeyshield.com' };
    sendSmtpEmail.htmlContent = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#1f2937;border-radius:12px;color:#f9fafb">
        <h2 style="color:#f59e0b;margin-bottom:8px">🛡️ JourneyShield</h2>
        <p style="color:#9ca3af;margin-bottom:24px">Your verification code is:</p>
        <div style="background:#111827;border-radius:8px;padding:24px;text-align:center;letter-spacing:12px;font-size:36px;font-weight:bold;color:#f59e0b">
          ${generatedOtp}
        </div>
        <p style="color:#6b7280;font-size:13px;margin-top:24px">This code expires in 5 minutes. Do not share it with anyone.</p>
      </div>
    `;

    await brevoClient.sendTransacEmail(sendSmtpEmail);
    console.log('[OTP] Email sent successfully to:', email);
    res.status(200).json({ message: 'OTP sent successfully to your email' });
  } catch (err) {
    console.error('[OTP] Send failed — code:', err.code, '| message:', err.message);
    res.status(500).json({ 
      message: 'Failed to send OTP email. Please ensure you entered a valid email address.',
      debug: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// ── Step 2: verify OTP & create user ──────────────────────────────────────────
export const verifyAndRegister = async (req, res) => {
  try {
    const { fullName, username, email, password, role, otp } = req.body;
    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name: fullName, username, email, password: hashedPassword, role: role || 'Traveler',
    });

    // Auto-create Guide profile if needed
    if (role === 'Guide' || role === 'Both') {
      const exists = await Guide.findOne({ user: user._id });
      if (!exists) await Guide.create({ user: user._id, bio: '', location: '' });
    }

    await OTP.findOneAndDelete({ email });

    res.status(201).json({
      _id: user.id, name: user.name, username: user.username,
      email: user.email, role: user.role,
      avatar: user.avatar || '',
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Database error during registration' });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { identifier, password, selectedRole } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Please provide email/username and password' });

    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email/username or password' });
    }
    if (user.role !== 'Both' && user.role !== selectedRole) {
      return res.status(403).json({ message: `Access denied. You do not have an account as a ${selectedRole}.` });
    }

    // Auto-create Guide profile if missing
    if ((user.role === 'Guide' || user.role === 'Both') && selectedRole === 'Guide') {
      const exists = await Guide.findOne({ user: user._id });
      if (!exists) await Guide.create({ user: user._id, bio: '', location: '' });
    }

    const activeRole = user.role === 'Both' ? selectedRole : user.role;
    res.status(200).json({
      _id: user.id, name: user.name, username: user.username,
      email: user.email, role: activeRole,
      avatar: user.avatar || '',
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET own traveler profile ───────────────────────────────────────────────────
// GET /api/users/me
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE own traveler profile ───────────────────────────────────────────────
// PUT /api/users/me
export const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const {
      bio, homeCity, phone, travelStyle, interests,
      languages, emergencyContact, socialLinks, avatar,
    } = req.body;

    if (bio         !== undefined) user.bio         = bio;
    if (homeCity    !== undefined) user.homeCity     = homeCity;
    if (phone       !== undefined) user.phone        = phone;
    if (travelStyle !== undefined) user.travelStyle  = travelStyle;
    if (interests   !== undefined) user.interests    = interests;
    if (languages   !== undefined) user.languages    = languages;
    if (avatar      !== undefined) user.avatar       = avatar;   // Cloudinary URL
    if (emergencyContact !== undefined) {
      user.emergencyContact = { ...user.emergencyContact.toObject(), ...emergencyContact };
    }
    if (socialLinks !== undefined) {
      user.socialLinks = { ...user.socialLinks.toObject(), ...socialLinks };
    }

    const saved = await user.save();
    const out   = saved.toObject();
    delete out.password;
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUBLIC guide profile (traveler viewing a guide) ───────────────────────────
// GET /api/users/guide/:userId
// Returns full guide profile merged with User name/email/avatar — NO phone until chat approved
export const getPublicGuideProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user   = await User.findById(userId).select('name email avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let guide = await Guide.findOne({ user: userId });
    if (!guide) guide = await Guide.create({ user: userId, bio: '', location: '' });

    // Merge into one object — phone hidden (shown only after chat approval in future)
    const profile = {
      _id:           user._id,
      name:          user.name,
      email:         user.email,
      avatar:        guide.avatar || user.avatar || '',
      bio:           guide.bio,
      location:      guide.location,
      experience:    guide.experience,
      languages:     guide.languages,
      specialties:   guide.specialties,
      availability:  guide.availability,
      pricePerHour:  guide.pricePerHour,
      certifications:guide.certifications,
      socialLinks:   guide.socialLinks,
      rating:        guide.rating,
      reviews:       guide.reviews,
      // phone intentionally omitted until chat module
    };

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── LIMITED traveler profile (guide viewing a traveler) ───────────────────────
// GET /api/users/traveler/:userId
// Returns only public-safe fields — no phone, no emergency contact
export const getPublicTravelerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name username avatar bio homeCity travelStyle interests languages socialLinks createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── All guides (used by Guides.jsx list page) ─────────────────────────────────
export const getGuides = async (req, res) => {
  try {
    const guideUsers = await User.find({ role: { $in: ['Guide', 'Both'] } }).select('_id name email avatar');
    const profiles = await Promise.all(guideUsers.map(async (u) => {
      let gp = await Guide.findOne({ user: u._id });
      if (!gp) gp = await Guide.create({ user: u._id, bio: '', location: '' });
      return {
        _id:          u._id,
        name:         u.name,
        email:        u.email,
        avatar:       gp.avatar || u.avatar || '',
        guideProfile: {
          bio:           gp.bio,
          location:      gp.location,
          experience:    gp.experience,
          languages:     gp.languages,
          specialties:   gp.specialties,
          availability:  gp.availability,
          pricePerHour:  gp.pricePerHour,
          certifications:gp.certifications,
          socialLinks:   gp.socialLinks,
          rating:        gp.rating,
          reviews:       gp.reviews,
        },
      };
    }));
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//=== Folder: C:\Users\Suyash Dubey\OneDrive\Desktop\SafeJourney\journeyshield-backend\data ===