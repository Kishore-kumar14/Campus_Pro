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

// Fetch my jobs (Client specific)
router.get('/my-jobs', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const jobs = await Job.find({ postedBy: userId }).sort({ createdAt: -1 }).lean();
    res.json(jobs);
  } catch (error) {
    console.error('Fetch My Jobs Error:', error);
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
  console.log('Incoming Bid:', req.body);
  try {
    const { bidAmount, pitchText } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      console.log('Bidding Failed: Unauthorized or malformed token');
      return res.status(401).json({ error: 'Identity Matrix Desynced. Please re-authenticate.' });
    }

    // Validation: Ensure parameters are present
    if (bidAmount === undefined || bidAmount === null || !pitchText || pitchText.trim() === '') {
      console.log('Bidding Validation Failed: Missing bidAmount or pitchText', { bidAmount, pitchText });
      return res.status(400).json({ error: 'Payload Incomplete: bidAmount and pitchText are required.' });
    }

    const amountNum = Number(bidAmount);
    if (isNaN(amountNum)) {
       return res.status(400).json({ error: 'Validation Error: bidAmount must be a numeric vector.' });
    }

    // Validate Job ID format before querying
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid Project Reference: Hash mismatch.' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Target project not found in the vault.' });
    }

    // Validation: Ensure bidder is not the owner
    if (job.postedBy.toString() === userId.toString()) {
      console.log('Bidding Validation Failed: Self-bidding detected', { userId, posterId: job.postedBy });
      return res.status(400).json({ error: 'Security Protocol: You cannot bid on your own project injection.' });
    }

    // Check if user already bid
    const existingBid = await Bid.findOne({ jobId: job._id, bidderId: userId });
    if (existingBid) {
      console.log('Bidding Validation Failed: Duplicate bid', { userId, jobId: job._id });
      return res.status(400).json({ error: 'Transmission Sync Error: A proposal already exists for this project.' });
    }

    const newBid = new Bid({
      jobId: job._id,
      bidderId: userId,
      amount: amountNum,
      proposal: pitchText,
    });

    await newBid.save();

    res.status(201).json({ message: 'Proposal submitted successfully.', bidId: newBid._id });
  } catch (error) {
    console.error('Bidding Error:', error);
    res.status(500).json({ error: 'Internal server error during handshake.' });
  }
});


// Fetch all proposals for a client's projects (Aggregated Stream)
router.get('/proposals/client', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const myJobs = await Job.find({ postedBy: userId });
    const jobIds = myJobs.map(job => job._id);

    const proposals = await Bid.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title budget jobType status')
      .populate('bidderId', 'fullName skills email')
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    console.error('Client Proposal Fetch Error:', error);
    res.status(500).json({ error: 'Failed to synchronize aggregated proposal stream.' });
  }
});

// Unified Proposal Submission Route
router.post('/proposals', authMiddleware, async (req, res) => {
  console.log('Incoming Proposal Handshake:', req.body);
  try {
    const { jobId, bidAmount, pitchText } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) return res.status(401).json({ error: 'Identity Matrix Desynced.' });

    if (!jobId || bidAmount === undefined || !pitchText) {
      return res.status(400).json({ error: 'Payload Incomplete: jobId, bidAmount, and pitchText required.' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Target project not found.' });

    if (job.postedBy.toString() === userId.toString()) {
      return res.status(400).json({ error: 'Security Protocol: Self-bidding restricted.' });
    }

    const existingBid = await Bid.findOne({ jobId, bidderId: userId });
    if (existingBid) {
      return res.status(400).json({ error: 'Transmission Sync: Proposal already exists.' });
    }

    const newBid = new Bid({
      jobId,
      bidderId: userId,
      amount: Number(bidAmount),
      proposal: pitchText,
    });

    await newBid.save();
    res.status(201).json({ message: 'Proposal successfully committed to the vault.', bidId: newBid._id });
  } catch (error) {
    console.error('Proposal Error:', error);
    res.status(500).json({ error: 'Internal server failure during handshake.' });
  }
});

// Fetch proposals for the student (My Projections)
router.get('/proposals/my-proposals', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    console.log('Fetching Proposals for Student ID:', userId);

    const bids = await Bid.find({ bidderId: userId })
      .populate({

        path: 'jobId',
        populate: { path: 'postedBy', select: 'fullName' }
      })
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    console.error('Fetch My Proposals Error:', error);
    res.status(500).json({ error: 'Failed to synchronize student proposal projection.' });
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

// Delete a project (With Security Validation)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });

    const userId = req.user.id || req.user._id;
    // Authorization: Must be the author
    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized. You did not author this project.' });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Bid.deleteMany({ jobId: req.params.id });

    res.json({ message: 'Project and all associated proposals have been withdrawn.' });
  } catch (error) {
    console.error('Delete Job Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Fetch all bids for a specific job (Only for the job owner)
router.get('/:id/bids', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });

    const userId = req.user.id || req.user._id;
    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized. You are not the owner of this project.' });
    }

    const bids = await Bid.find({ jobId: req.params.id })
      .populate('bidderId', 'fullName email skills')
      .sort({ createdAt: -1 });
    
    res.json(bids);
  } catch (error) {
    console.error('Fetch Bids Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Accept a bid
router.post('/bids/:id/accept', authMiddleware, async (req, res) => {
  try {
    const bidId = req.params.id;
    const bid = await Bid.findById(bidId);
    if (!bid) return res.status(404).json({ error: 'Proposal not found.' });

    const job = await Job.findById(bid.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found.' });

    const userId = req.user.id || req.user._id;
    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to accept this proposal.' });
    }

    // Update Bid status
    bid.status = 'Accepted';
    await bid.save();

    // Reject all other bids for this job
    await Bid.updateMany(
      { jobId: job._id, _id: { $ne: bidId } },
      { $set: { status: 'Rejected' } }
    );

    // Update Job status and assigned student
    job.status = 'In Progress';
    job.assignedTo = bid.bidderId;
    await job.save();

    res.json({ message: 'Proposal accepted and project started.', job });
  } catch (error) {
    console.error('Accept Bid Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Fetch my bids (Student specific)
router.get('/my-bids', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const bids = await Bid.find({ bidderId: userId })
      .populate({
        path: 'jobId',
        populate: { path: 'postedBy', select: 'fullName' }
      })
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    console.error('Fetch My Bids Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;

