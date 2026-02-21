import Tour from '../models/tourModel.js';

// @desc    Create a new group tour (Guide only)
// @route   POST /api/tours
export const createTour = async (req, res) => {
  try {
    const { title, description, location, fixedDate, maxParticipants, pricePerPerson } = req.body;

    const tour = await Tour.create({
      guide: req.user._id,
      title,
      description,
      location,
      fixedDate,
      maxParticipants,
      pricePerPerson
    });

    res.status(201).json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tour', error: error.message });
  }
};

// @desc    Get all available open tours
// @route   GET /api/tours
export const getAvailableTours = async (req, res) => {
  try {
    const tours = await Tour.find({ status: 'Open', fixedDate: { $gte: new Date() } })
      .populate('guide', 'name email')
      .populate('travelers', 'name'); // Gets the names of travelers

    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tours', error: error.message });
  }
};

// @desc    Join a group tour (Traveler)
// @route   POST /api/tours/:id/join
export const joinTour = async (req, res) => {
  try {
    if (req.user.role === 'Guide') {
      return res.status(403).json({ message: 'Guides cannot join tours as travelers.' });
    }

    const tour = await Tour.findById(req.params.id);

    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    if (tour.status !== 'Open') return res.status(400).json({ message: 'Tour is no longer open' });
    
    // Check if the user was previously kicked from this specific tour
    const isKicked = tour.kickedTravelers.some(k => k.user.toString() === req.user._id.toString());
    if (isKicked) {
      return res.status(403).json({ message: 'You have been removed from this group by the guide and cannot rejoin.' });
    }

    if (tour.guide.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot join your own tour.' });
    }
    if (tour.travelers.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already joined this tour' });
    }
    if (tour.travelers.length >= tour.maxParticipants) {
      return res.status(400).json({ message: 'Tour is full' });
    }

    // Add user to the tour
    tour.travelers.push(req.user._id);
    
    // If full after joining, update status
    if (tour.travelers.length === tour.maxParticipants) {
      tour.status = 'Full';
    }

    await tour.save();
    res.status(200).json({ message: 'Successfully joined the tour!', tour });
  } catch (error) {
    res.status(500).json({ message: 'Error joining tour', error: error.message });
  }
};

// @desc    Kick a traveler from the tour (Guide only)
// @route   POST /api/tours/:id/kick
export const kickTraveler = async (req, res) => {
  try {
    const { travelerId, reason } = req.body;
    const tour = await Tour.findById(req.params.id);

    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    
    if (tour.guide.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host guide can remove members.' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'You must provide a reason for removing this traveler.' });
    }

    // Remove from travelers array
    tour.travelers = tour.travelers.filter(t => t.toString() !== travelerId);
    
    // Add to kicked array
    tour.kickedTravelers.push({ user: travelerId, reason: reason });

    // If tour was full, it's now open again
    if (tour.status === 'Full') {
      tour.status = 'Open';
    }

    await tour.save();
    res.status(200).json({ message: 'Traveler removed successfully.', tour });
  } catch (error) {
    res.status(500).json({ message: 'Error removing traveler', error: error.message });
  }
};

// @desc    Cancel/Delete a group tour entirely (Guide only)
// @route   DELETE /api/tours/:id
export const cancelTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    
    if (tour.guide.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host guide can cancel this tour.' });
    }

    // Delete the tour completely
    await Tour.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Tour cancelled and deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling tour', error: error.message });
  }
};