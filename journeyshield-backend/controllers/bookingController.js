import Booking from '../models/bookingModel.js';

// @desc    Create a new booking (Traveler hiring a Guide)
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { guideId, date, isPrivateGroup, groupMembers } = req.body;

    if (!guideId || !date) {
      return res.status(400).json({ message: 'Guide and Date are required.' });
    }

    if (guideId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book yourself.' });
    }

    const booking = await Booking.create({
      traveler: req.user._id,
      guide: guideId,
      date,
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
      .populate('traveler', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching guide requests', error: error.message });
  }
};

// @desc    Update booking status
//          Guide: Accepted → Rejected → Completed
//          Traveler: cannot change status
// @route   PUT /api/bookings/:id/status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Accepted', 'Rejected', 'Completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the assigned guide can update status
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