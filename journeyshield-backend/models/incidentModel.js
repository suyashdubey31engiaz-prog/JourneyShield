import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    // Added 'Pickpocketing' to this list so the seeder works
    enum: ['Theft', 'Harassment', 'Assault', 'Scam', 'Unsafe Area', 'Other', 'Pickpocketing'],
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'], 
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // Format: [longitude, latitude]
      required: true
    },
    address: String
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verified: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

incidentSchema.index({ location: '2dsphere' });

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;