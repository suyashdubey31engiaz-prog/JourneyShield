import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  type: {
    type: String,
    required: true,
    enum: ['weather', 'crowd', 'traffic', 'general'],
    default: 'general',
  }
}, {
  timestamps: true,
});

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;