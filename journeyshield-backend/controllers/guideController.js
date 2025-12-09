import Guide from '../models/guideModel.js';

// @desc    Fetch all guides (Public)
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

// @desc    Get current guide's profile
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

// @desc    Update guide profile
// @route   PUT /api/guides/profile
// @access  Private (Guide)
const updateGuideProfile = async (req, res) => {
  const { location, bio } = req.body;

  try {
    const guide = await Guide.findOne({ user: req.user._id });

    if (guide) {
      guide.location = location || guide.location;
      guide.bio = bio || guide.bio;
      
      const updatedGuide = await guide.save();
      res.json(updatedGuide);
    } else {
      res.status(404).json({ message: 'Guide profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getGuides, getMyGuideProfile, updateGuideProfile };