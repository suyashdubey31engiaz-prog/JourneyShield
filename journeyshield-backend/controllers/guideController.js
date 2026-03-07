import Guide from '../models/guideModel.js';

// @desc    Fetch all guides with extended profile
// @route   GET /api/guides
// @access  Protected
const getGuides = async (req, res) => {
  try {
    const guides = await Guide.find({}).populate('user', 'name email');
    res.json(guides);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get current guide's full profile
// @route   GET /api/guides/me
// @access  Private (Guide)
const getMyGuideProfile = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user._id }).populate('user', 'name email');
    if (guide) {
      res.json(guide);
    } else {
      res.status(404).json({ message: 'Guide profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update guide profile (all fields)
// @route   PUT /api/guides/profile
// @access  Private (Guide)
const updateGuideProfile = async (req, res) => {
  const {
    location,
    bio,
    experience,
    languages,
    specialties,
    phone,
    availability,
    pricePerHour,
    certifications,
    socialLinks,
  } = req.body;

  try {
    const guide = await Guide.findOne({ user: req.user._id });

    if (!guide) {
      return res.status(404).json({ message: 'Guide profile not found' });
    }

    // Update only the fields that were actually sent
    if (location    !== undefined) guide.location     = location;
    if (bio         !== undefined) guide.bio          = bio;
    if (experience  !== undefined) guide.experience   = experience;
    if (phone       !== undefined) guide.phone        = phone;
    if (availability!== undefined) guide.availability = availability;
    if (pricePerHour!== undefined) guide.pricePerHour = Number(pricePerHour) || 0;
    if (certifications !== undefined) guide.certifications = certifications;

    // Arrays — replace entirely if provided
    if (Array.isArray(languages))  guide.languages  = languages;
    if (Array.isArray(specialties)) guide.specialties = specialties;

    // Nested object — merge individual sub-fields
    if (socialLinks) {
      guide.socialLinks = {
        instagram: socialLinks.instagram ?? guide.socialLinks?.instagram ?? '',
        facebook:  socialLinks.facebook  ?? guide.socialLinks?.facebook  ?? '',
        website:   socialLinks.website   ?? guide.socialLinks?.website   ?? '',
      };
    }

    const updatedGuide = await guide.save();
    res.json(updatedGuide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getGuides, getMyGuideProfile, updateGuideProfile };