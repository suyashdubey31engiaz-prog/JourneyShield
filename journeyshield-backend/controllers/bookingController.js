import Booking from '../models/bookingModel.js';

// @desc    Create a new booking (Traveler hiring a Guide)
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { guideId, date, isPrivateGroup, groupMembers } = req.body;

    // Basic validation
    if (!guideId || !date) {
      return res.status(400).json({ message: 'Guide and Date are required.' });
    }

    // Ensure the traveler isn't trying to book themselves
    if (guideId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book yourself.' });
    }

    const booking = await Booking.create({
      traveler: req.user._id, 
      guide: guideId,
      date: date,
      isPrivateGroup: isPrivateGroup || false,
      groupMembers: isPrivateGroup ? groupMembers : [], 
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

// @desc    Get all bookings made by the logged-in Traveler
// @route   GET /api/bookings/mybookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ traveler: req.user._id })
      // THIS is the line that fixes "Guide: Unknown"
      .populate('guide', 'name email') 
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your bookings', error: error.message });
  }
};

// @desc    Get all booking requests received by the logged-in Guide
// @route   GET /api/bookings/guidebookings
export const getGuideBookings = async (req, res) => {
  try {
    if (req.user.role !== 'Guide') {
      return res.status(403).json({ message: 'Access denied. Only guides can view these bookings.' });
    }

    const bookings = await Booking.find({ guide: req.user._id })
      // This gets the Traveler's name so the Guide can see who is booking them
      .populate('traveler', 'name email') 
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching guide requests', error: error.message });
  }
};

// @desc    Update booking status (Guide accepting/rejecting a request)
// @route   PUT /api/bookings/:id/status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body; 
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the person updating the status is actually the guide assigned to this booking
    if (booking.guide.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
};