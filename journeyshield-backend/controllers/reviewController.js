import Review  from '../models/reviewModel.js';
import Guide   from '../models/guideModel.js';
import Booking from '../models/bookingModel.js';

// Helper — recalculate and save guide's avg rating
const refreshGuideRating = async (guideId) => {
  const all = await Review.find({ guide: guideId });
  if (!all.length) return;
  const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
  await Guide.findByIdAndUpdate(guideId, {
    rating:  avg.toFixed(1),
    reviews: all.length,
  });
};

// ── POST /api/reviews ─────────────────────────────────────────────────────────
// Submit a review from a completed booking.
// Rules:
//   • booking must be Completed + belong to this traveler + not already used for a review
//   • if traveler already has a review for this guide → UPDATE it (editCount++)
//   • otherwise → CREATE a new review document
export const createOrUpdateReview = async (req, res) => {
  const { guideId, rating, comment, bookingId } = req.body;

  try {
    // 1. Resolve the Guide document from User._id
    let guideDoc = await Guide.findOne({ user: guideId });
    if (!guideDoc) {
      // Auto-create for legacy accounts
      guideDoc = await Guide.create({ user: guideId, bio: '', location: '' });
    }

    // 2. Verify booking
    const booking = await Booking.findOne({
      _id:      bookingId,
      traveler: req.user._id,
      guide:    guideId,
      status:  'Completed',
    });

    if (!booking) {
      return res.status(400).json({ message: 'Invalid booking. Only completed trips can be reviewed.' });
    }

    if (booking.isReviewed) {
      return res.status(400).json({ message: 'You have already submitted a review for this booking.' });
    }

    // 3. Existing review for this guide by this traveler?
    const existing = await Review.findOne({ user: req.user._id, guide: guideDoc._id });

    if (existing) {
      // UPDATE — increment editCount so UI can show "edited N times"
      existing.rating    = Number(rating);
      existing.comment   = comment;
      existing.editCount = (existing.editCount || 0) + 1;
      await existing.save();
    } else {
      // CREATE first review
      await Review.create({
        user:    req.user._id,
        guide:   guideDoc._id,
        rating:  Number(rating),
        comment,
        editCount: 0,
      });
    }

    // 4. Mark booking as used for review
    booking.isReviewed = true;
    await booking.save();

    // 5. Recalculate guide rating
    await refreshGuideRating(guideDoc._id);

    res.status(200).json({ message: 'Review saved successfully.' });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ message: 'Server error saving review.' });
  }
};

// ── GET /api/reviews/:guideId ─────────────────────────────────────────────────
// Public — all reviews for a guide.
// Only exposes: name (first + last initial), rating, comment, createdAt, updatedAt, editCount
export const getGuideReviews = async (req, res) => {
  try {
    // guideId may be either a Guide._id or User._id — handle both
    let guideDoc = await Guide.findById(req.params.guideId);
    if (!guideDoc) {
      guideDoc = await Guide.findOne({ user: req.params.guideId });
    }

    const query = guideDoc ? { guide: guideDoc._id } : { guide: req.params.guideId };

    const reviews = await Review.find(query)
      .populate('user', 'name')
      .sort({ updatedAt: -1 });

    // Sanitise — only expose what the public should see
    const safe = reviews.map(r => ({
      _id:       r._id,
      rating:    r.rating,
      comment:   r.comment,
      editCount: r.editCount || 0,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      // Only first name + last initial e.g. "Suyash D."
      reviewer: r.user?.name
        ? (() => {
            const parts = r.user.name.trim().split(' ');
            return parts.length > 1
              ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
              : parts[0];
          })()
        : 'Traveler',
      // We include user._id so the frontend can highlight "your review"
      userId: r.user?._id,
    }));

    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/reviews/:guideId/my ─────────────────────────────────────────────
// Private — returns the calling traveler's own review for a guide (if any).
// Used by the frontend to pre-fill the edit modal.
export const getMyReviewForGuide = async (req, res) => {
  try {
    let guideDoc = await Guide.findById(req.params.guideId);
    if (!guideDoc) guideDoc = await Guide.findOne({ user: req.params.guideId });

    const query = guideDoc
      ? { user: req.user._id, guide: guideDoc._id }
      : { user: req.user._id, guide: req.params.guideId };

    const review = await Review.findOne(query);
    if (!review) return res.json(null);

    res.json({
      _id:       review._id,
      rating:    review.rating,
      comment:   review.comment,
      editCount: review.editCount || 0,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};