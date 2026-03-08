import Guide from '../models/guideModel.js';
import User  from '../models/userModel.js';

// ── GET own guide profile (full) ─────────────────────────────────────────────
export const getMyGuideProfile = async (req, res) => {
  try {
    let guide = await Guide.findOne({ user: req.user._id });
    if (!guide) guide = await Guide.create({ user: req.user._id, bio: '', location: '' });
    const user = await User.findById(req.user._id).select('name email avatar');
    res.json({ ...guide.toObject(), userName: user?.name, userEmail: user?.email, userAvatar: user?.avatar || '' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE own guide profile (all fields) ────────────────────────────────────
export const updateGuideProfile = async (req, res) => {
  const {
    bio, location, experience, languages, specialties,
    phone, availability, pricePerHour, certifications, socialLinks, avatar,
  } = req.body;

  try {
    let guide = await Guide.findOne({ user: req.user._id });
    if (!guide) guide = await Guide.create({ user: req.user._id, bio: '', location: '' });

    if (bio           !== undefined) guide.bio           = bio;
    if (location      !== undefined) guide.location      = location;
    if (experience    !== undefined) guide.experience    = experience;
    if (languages     !== undefined) guide.languages     = languages;
    if (specialties   !== undefined) guide.specialties   = specialties;
    if (phone         !== undefined) guide.phone         = phone;
    if (availability  !== undefined) guide.availability  = availability;
    if (pricePerHour  !== undefined) guide.pricePerHour  = pricePerHour;
    if (certifications!== undefined) guide.certifications= certifications;
    if (avatar        !== undefined) guide.avatar        = avatar;  // Cloudinary URL
    if (socialLinks   !== undefined) {
      guide.socialLinks = { ...guide.socialLinks.toObject(), ...socialLinks };
    }

    const saved = await guide.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── List all guides (used by admin/guides page) ───────────────────────────────
export const getGuides = async (req, res) => {
  try {
    const guides = await Guide.find({}).populate('user', 'name email avatar');
    res.json(guides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};