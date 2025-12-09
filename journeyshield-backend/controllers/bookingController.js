import Booking from '../models/bookingModel.js';
import Guide from '../models/guideModel.js';

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Traveler)
const createBooking = async (req, res) => {
  const { guideId, date, notes } = req.body;

  if (!guideId || !date) {
    return res.status(400).json({ message: 'Guide and Date are required' });
  }

  try {
    // Ensure the guide exists
    const guideExists = await Guide.findById(guideId);
    if (!guideExists) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    const booking = await Booking.create({
      traveler: req.user._id,
      guide: guideId,
      date,
      notes
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bookings for the logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    let bookings;

    // If user is a Guide, find bookings where they are the guide
    // We need to find the Guide profile associated with this User first
    if (req.user.role === 'Guide') {
      const guideProfile = await Guide.findOne({ user: req.user._id });
      if (!guideProfile) {
        return res.json([]); // No profile, no bookings
      }
      bookings = await Booking.find({ guide: guideProfile._id })
        .populate('traveler', 'name email')
        .sort({ date: 1 }); // Sort by date ascending
    } 
    // If user is a Traveler, find bookings they created
    else {
      bookings = await Booking.find({ traveler: req.user._id })
        .populate({
          path: 'guide',
          populate: { path: 'user', select: 'name email' } // Deep populate to get Guide's name
        })
        .sort({ date: 1 });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Confirm/Reject)
// @route   PUT /api/bookings/:id
// @access  Private (Guide Only)
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify the logged-in user owns this guide profile
    const guideProfile = await Guide.findById(booking.guide);
    if (guideProfile.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createBooking, getMyBookings, updateBookingStatus };