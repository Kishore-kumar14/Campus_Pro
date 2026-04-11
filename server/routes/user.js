const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Toggle exam mode (New Unified Route)
router.patch('/update-exam-mode', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { examMode } = req.body;

    if (typeof examMode !== 'boolean') {
      return res.status(400).json({ error: 'examMode must be a boolean.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { examMode },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'Focus Mode status synchronized.', user: updatedUser });
  } catch (error) {
    console.error('Exam Mode Sync Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Fetch user profile and portfolio
router.get('/profile/portfolio', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId)
      .select('-password -verificationToken')
      .populate('completedJobs');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let postedJobs = [];
    let receivedBids = 0;
    let activeBids = 0;

    if (user.role === 'Client') {
      postedJobs = await Job.find({ postedBy: userId }).sort({ createdAt: -1 });
      const jobIds = postedJobs.map(j => j._id);
      receivedBids = await Bid.countDocuments({ jobId: { $in: jobIds } });
    } else {
      // For Students: count their active proposals
      activeBids = await Bid.countDocuments({ bidderId: userId });
    }

    res.json({ user, postedJobs, receivedBids, activeBids });
  } catch (error) {
    console.error('Portfolio Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
