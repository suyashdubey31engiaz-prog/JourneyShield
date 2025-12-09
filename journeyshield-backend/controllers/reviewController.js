import Review from '../models/reviewModel.js';
import Guide from '../models/guideModel.js';
import Booking from '../models/bookingModel.js';

// @desc    Create or Update a review for a guide
// @route   POST /api/reviews
// @access  Private (Traveler)
const createOrUpdateReview = async (req, res) => {
  const { guideId, rating, comment, bookingId } = req.body;

  try {
    // 1. Verify the booking exists, is completed, and belongs to this user
    const booking = await Booking.findOne({
      _id: bookingId,
      traveler: req.user._id,
      guide: guideId,
      status: 'Completed'
    });

    if (!booking) {
      return res.status(400).json({ message: 'Invalid booking. You can only review completed trips.' });
    }

    // 2. Enforce "No multiple reviews on single trip"
    if (booking.isReviewed) {
      return res.status(400).json({ message: 'This trip has already been used to leave a review.' });
    }

    // 3. Check if User has EVER reviewed this Guide before
    const existingReview = await Review.findOne({
      user: req.user._id,
      guide: guideId
    });

    if (existingReview) {
      // UPDATE existing review (The "Experience Again" Logic)
      existingReview.rating = Number(rating);
      existingReview.comment = comment;
      // We update the timestamp to show it's fresh
      existingReview.updatedAt = Date.now(); 
      await existingReview.save();
    } else {
      // CREATE new review (First time experience)
      await Review.create({
        user: req.user._id,
        guide: guideId,
        rating: Number(rating),
        comment
      });
    }

    // 4. Mark this booking as 'used' for reviewing
    booking.isReviewed = true;
    await booking.save();

    // 5. Recalculate Guide's Average Rating
    const reviews = await Review.find({ guide: guideId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await Guide.findByIdAndUpdate(guideId, {
      rating: avgRating.toFixed(1),
      reviews: reviews.length
    });

    res.status(200).json({ message: 'Review updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get reviews for a specific guide
// @route   GET /api/reviews/:guideId
// @access  Public
const getGuideReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ guide: req.params.guideId })
      .populate('user', 'name')
      .sort({ updatedAt: -1 }); // Sort by newest update
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createOrUpdateReview, getGuideReviews };