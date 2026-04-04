const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in)$/i, 'Please enter a valid institutional email (.edu or .ac.in)']
  },
  password: {
    type: String,
    required: true,
  },
  examMode: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['Student', 'Client'],
    default: 'Student'
  },
  skills: [{
    type: String
  }],
  completedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  badges: [{
    type: String
  }],
  endorsements: [{
    type: String
  }],
  verificationToken: {
    type: String,
  },
  points: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('User', userSchema);
