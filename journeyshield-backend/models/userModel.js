import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Full name is required'] 
  },
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'] 
  },
  role: { 
    type: String, 
    enum: ['Traveler', 'Guide', 'Admin'], 
    default: 'Traveler' 
  },
  location: { type: String }, // Optional for guides
  bio: { type: String }       // Optional for guides
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;