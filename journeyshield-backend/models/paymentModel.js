import mongoose from 'mongoose';

const timelineStepSchema = new mongoose.Schema({
  step:        { type: String, required: true },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date, default: Date.now },
  note:        { type: String, default: '' },
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  booking:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  traveler: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  guide:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },

  // ── Amount ────────────────────────────────────────────────────────────────────
  // For Cash mode: guide receives full amount. No deductions applied yet.
  // Platform fee & GST will be added when Razorpay online payment is enabled.
  totalAmount:   { type: Number, required: true },
  guideReceives: { type: Number, required: true }, // = totalAmount for Cash mode
  currency:      { type: String, default: 'INR' },

  // Reserved for future Razorpay integration — not used in Cash mode
  platformFee:     { type: Number, default: 0 },
  gstOnFee:        { type: Number, default: 0 },
  platformEarns:   { type: Number, default: 0 },
  platformFeeRate: { type: Number, default: 0 }, // will be 5 when online enabled
  gstRate:         { type: Number, default: 0 }, // will be 18 when online enabled

  method:   { type: String, enum: ['Cash', 'Online', 'Pending'], default: 'Pending' },

  status: {
    type: String,
    enum: ['initiated', 'traveler_confirmed', 'guide_confirmed', 'completed'],
    default: 'initiated',
  },

  timeline: [timelineStepSchema],

  // Auto-delete after 6 months
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 0 },
  },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;