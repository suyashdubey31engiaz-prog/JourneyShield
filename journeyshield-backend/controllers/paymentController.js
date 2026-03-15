import Payment from '../models/paymentModel.js';
import Booking from '../models/bookingModel.js';
import Guide   from '../models/guideModel.js';

// ── Amount calculator ────────────────────────────────────────────────────────
// Cash mode: guide receives full amount. No deductions.
// Platform fee & GST reserved for future Razorpay integration.
const calcBreakdown = (total) => ({
  guideReceives:   total,
  platformFee:     0,
  gstOnFee:        0,
  platformEarns:   0,
  platformFeeRate: 0,
  gstRate:         0,
});

// ── Helper: add timeline step ─────────────────────────────────────────────────
const addStep = (payment, step, userId, note = '') => {
  payment.timeline.push({ step, completedBy: userId, completedAt: new Date(), note });
};

// ── POST /api/payments/initiate ───────────────────────────────────────────────
export const initiatePayment = async (req, res) => {
  try {
    const { bookingId, method } = req.body;
    if (!bookingId || !method) return res.status(400).json({ message: 'bookingId and method are required.' });

    const booking = await Booking.findById(bookingId).populate('guide', 'name');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (booking.traveler.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the traveler can initiate payment.' });

    if (booking.status !== 'Accepted')
      return res.status(400).json({ message: 'Payment can only be initiated for Accepted bookings.' });

    const existing = await Payment.findOne({ booking: bookingId });
    if (existing) return res.status(400).json({ message: 'Payment already initiated for this booking.' });

    // Get guide's price
    const guideProfile = await Guide.findOne({ user: booking.guide._id });
    const total = guideProfile?.pricePerHour || 0;

    // Calculate breakdown
    const breakdown = calcBreakdown(total);

    const payment = await Payment.create({
      booking:  bookingId,
      traveler: req.user._id,
      guide:    booking.guide._id,
      totalAmount:   total,
      ...breakdown,
      method,
      status: 'initiated',
      timeline: [
        {
          step:        '✅ Booking Accepted',
          completedBy: booking.guide._id,
          completedAt: booking.updatedAt,
          note:        `Guide ${booking.guide.name} accepted the booking`,
        },
        {
          step:        '💳 Payment Initiated',
          completedBy: req.user._id,
          completedAt: new Date(),
          note:        `${method} payment of ₹${total} — guide receives full amount (platform fee applies when online payment enabled)`,
        },
      ],
    });

    res.status(201).json({ message: 'Payment initiated.', payment });
  } catch (err) {
    console.error('initiatePayment:', err);
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/payments/:bookingId/traveler-confirm ─────────────────────────────
export const travelerConfirm = async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId });
    if (!payment) return res.status(404).json({ message: 'Payment record not found.' });

    if (payment.traveler.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the traveler can confirm this.' });

    if (payment.status !== 'initiated')
      return res.status(400).json({ message: 'Payment already confirmed by traveler.' });

    payment.status = 'traveler_confirmed';
    addStep(payment, '🙋 Traveler Confirmed Payment', req.user._id,
      `Traveler confirmed ₹${payment.totalAmount} ${payment.method} payment was sent to guide`);
    await payment.save();

    res.json({ message: 'Confirmed. Waiting for guide to confirm receipt.', payment });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── PUT /api/payments/:bookingId/guide-confirm ────────────────────────────────
export const guideConfirm = async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId });
    if (!payment) return res.status(404).json({ message: 'Payment record not found.' });

    if (payment.guide.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the guide can confirm receipt.' });

    if (payment.status !== 'traveler_confirmed')
      return res.status(400).json({ message: 'Traveler must confirm payment first.' });

    payment.status = 'completed';
    addStep(payment, '🎯 Guide Confirmed Receipt', req.user._id,
      `Guide confirmed receipt of ₹${payment.guideReceives} via ${payment.method}`);
    addStep(payment, '🏁 Tour Completed', req.user._id,
      `Both parties confirmed. Platform fee: ₹${payment.platformFee} | GST: ₹${payment.gstOnFee}`);
    await payment.save();

    // Mark booking completed
    await Booking.findByIdAndUpdate(payment.booking, { status: 'Completed' });

    res.json({ message: 'Tour completed successfully!', payment });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── GET /api/payments/:bookingId ──────────────────────────────────────────────
export const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId })
      .populate('traveler', 'name')
      .populate('guide',    'name')
      .populate('timeline.completedBy', 'name');

    if (!payment) return res.status(404).json({ message: 'No payment record found.' });

    const uid = req.user._id.toString();
    if (payment.traveler._id.toString() !== uid && payment.guide._id.toString() !== uid)
      return res.status(403).json({ message: 'Access denied.' });

    res.json(payment);
  } catch (err) { res.status(500).json({ message: err.message }); }
};