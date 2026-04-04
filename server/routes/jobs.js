const express = require('express');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, description, jobType, budget, milestones, requestedSkill } = req.body;

    // Validate required base fields
    if (!title || !description || !jobType) {
      return res.status(400).json({ error: 'Title, description, and jobType are required.' });
    }

    if (!['Monetary', 'Skill-Swap'].includes(jobType)) {
      return res.status(400).json({ error: 'Invalid jobType. Must be Monetary or Skill-Swap.' });
    }

    let finalBudget = budget;
    let finalMilestones = milestones;
    let finalRequestedSkill = requestedSkill;

    if (jobType === 'Monetary') {
      if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
        return res.status(400).json({ error: 'Monetary jobs require an array of milestones with specific dates and amounts.' });
      }
      finalRequestedSkill = undefined; // Force nullify if it's monetary
    } else if (jobType === 'Skill-Swap') {
      if (!requestedSkill) {
         return res.status(400).json({ error: "Skill-Swap jobs require a 'Requested Skill'." });
      }
      finalBudget = 0;
      finalMilestones = undefined;
    }

    // Attempt to extract user id from auth token
    const postedBy = req.user.id || req.user._id;

    if (!postedBy) {
       return res.status(403).json({ error: 'Valid user ID is missing from the authorization token.' });
    }

    const newJob = new Job({
      title,
      description,
      jobType,
      budget: finalBudget,
      milestones: finalMilestones,
      requestedSkill: finalRequestedSkill,
      postedBy
    });

    await newJob.save();

    res.status(201).json({ 
      message: 'Job successfully created', 
      jobId: newJob._id 
    });
  } catch (error) {
    console.error('Job Creation Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, requiredSkills } = req.query;
    let query = { status: 'Open' };

    if (type) {
      query.jobType = type;
    }

    if (requiredSkills) {
      // Assuming requiredSkills query is a string or array
      query.requestedSkill = { $regex: new RegExp(requiredSkills, 'i') };
    }

    let jobs = await Job.find(query).populate("postedBy", "fullName").lean();

    // Smart Match Score calculation
    const userSkills = req.user.skills || [];
    
    jobs = jobs.map(job => {
      let score = 0;
      if (job.jobType === 'Skill-Swap' && job.requestedSkill) {
        // Simple string matching: if user has the requested skill text anywhere
        const jobSkill = job.requestedSkill.toLowerCase();
        const hasSkill = userSkills.some(s => jobSkill.includes(s.toLowerCase()) || s.toLowerCase().includes(jobSkill));
        if (hasSkill) score = 100;
        // Or partial match logic based on string
      }
      return { ...job, matchScore: score };
    });

    // Sort by highest match score first, then newest
    jobs.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(jobs);
  } catch (error) {
    console.error('Fetching Jobs Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Fetch a single job by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'fullName email');
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }
    res.json(job);
  } catch (error) {
    console.error('Fetch Job Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Submit a bid for a job
router.post('/:id/bid', authMiddleware, async (req, res) => {
  try {
    const { amount, proposal } = req.body;
    const userId = req.user.id || req.user._id;

    if (!req.user.isVerified) {
      return res.status(403).json({ error: 'Please verify your institutional email before bidding.' });
    }

    if (!amount || !proposal) {
      return res.status(400).json({ error: 'Amount and proposal text are required.' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Validation: Ensure bidder is not the owner
    if (job.postedBy.toString() === userId.toString()) {
      return res.status(400).json({ error: 'You cannot bid on your own job.' });
    }

    // Check if user already bid
    const existingBid = await Bid.findOne({ jobId: job._id, bidderId: userId });
    if (existingBid) {
      return res.status(400).json({ error: 'You have already submitted a proposal for this job.' });
    }

    const newBid = new Bid({
      jobId: job._id,
      bidderId: userId,
      amount,
      proposal,
    });

    await newBid.save();

    res.status(201).json({ message: 'Proposal submitted successfully.', bidId: newBid._id });
  } catch (error) {
    console.error('Bidding Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update job and payment status (Escrow Simulation)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const userId = req.user.id || req.user._id;

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });

    // Authorization: Only the owner (Client) should be able to initiate this simulation
    // In a real escrow, the client pays the platform to hold funds.
    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to update this job status.' });
    }

    if (status) job.status = status;
    if (paymentStatus) job.paymentStatus = paymentStatus;

    await job.save();

    res.json({ message: 'Job status updated successfully.', job });
  } catch (error) {
    console.error('Status Update Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
