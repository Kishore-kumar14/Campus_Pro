const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
});

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  jobType: { 
    type: String, 
    enum: ['Monetary', 'Skill-Swap'], 
    required: true 
  },
  budget: { type: Number, default: 0 },
  category: { type: String },
  milestones: [milestoneSchema],
  requestedSkill: { type: String },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Closed'],
    default: 'Open'
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Funds Held', 'Released'],
    default: 'Unpaid'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Job', jobSchema);
