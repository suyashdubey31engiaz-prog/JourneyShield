import Review  from '../models/reviewModel.js';
import Guide   from '../models/guideModel.js';
import Booking from '../models/bookingModel.js';

// POST /api/reviews
const createOrUpdateReview = async (req, res) => {
  const { guideId, rating, comment, bookingId } = req.body;

  console.log('[Review] incoming:', { guideId, rating, bookingId, userId: req.user?._id });

  try {
    // ── 1. Verify booking is Completed and belongs to this traveler ──────────
    const booking = await Booking.findOne({
      _id:      bookingId,
      traveler: req.user._id,
      guide:    guideId,   // bookingModel.guide refs User — guideId is User._id ✓
      status:   'Completed',
    });

    if (!booking) {
      return res.status(400).json({
        message: 'Invalid booking. You can only review completed trips.',
      });
    }

    if (booking.isReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this trip.' });
    }

    // ── 2. Resolve Guide document _id — auto-create if missing ───────────────
    // bookingModel.guide  = User._id   (refs User collection)
    // reviewModel.guide   = Guide._id  (refs Guide collection — different!)
    // Guides who registered before the auto-create fix was deployed won't have
    // a Guide document. Instead of blocking the review, we create it now.
    let guideProfile = await Guide.findOne({ user: guideId });

    if (!guideProfile) {
      console.log('[Review] Guide profile missing — auto-creating for user:', guideId);
      guideProfile = await Guide.create({
        user:     guideId,
        location: '',
        bio:      '',
      });
    }

    const guideDocId = guideProfile._id;

    // ── 3. Create or update the review ───────────────────────────────────────
    const existing = await Review.findOne({ user: req.user._id, guide: guideDocId });

    if (existing) {
      existing.rating  = Number(rating);
      existing.comment = comment;
      await existing.save();
    } else {
      await Review.create({
        user:    req.user._id,
        guide:   guideDocId,
        rating:  Number(rating),
        comment,
      });
    }

    // ── 4. Mark booking as reviewed ──────────────────────────────────────────
    booking.isReviewed = true;
    await booking.save();

    // ── 5. Recalculate guide's average rating ─────────────────────────────────
    const allReviews = await Review.find({ guide: guideDocId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Guide.findByIdAndUpdate(guideDocId, {
      rating:  Number(avg.toFixed(1)),
      reviews: allReviews.length,
    });

    console.log('[Review] submitted successfully');
    res.status(200).json({ message: 'Review submitted successfully' });

  } catch (error) {
    console.error('[Review] ERROR:', error);
    res.status(500).json({ message: 'Server Error', detail: error.message });
  }
};

// GET /api/reviews/:guideId
// Accepts either a Guide._id or a User._id — handles both gracefully
const getGuideReviews = async (req, res) => {
  try {
    let guideDocId = req.params.guideId;

    // If no reviews found by direct Guide._id, try resolving via User._id
    const direct = await Review.countDocuments({ guide: guideDocId });
    if (direct === 0) {
      const profile = await Guide.findOne({ user: guideDocId });
      if (profile) guideDocId = profile._id;
    }

    const reviews = await Review.find({ guide: guideDocId })
      .populate('user', 'name')
      .sort({ updatedAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createOrUpdateReview, getGuideReviews };