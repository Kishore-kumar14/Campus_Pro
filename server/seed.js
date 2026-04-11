const mongoose = require('mongoose');
const Job = require('./models/Job');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://mongodb:27017/campuspro';

const seedJobs = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database');

    // Create or find a test user to act as the job poster
    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        fullName: 'Riviera Admin',
        email: 'admin@vit.ac.in',
        password: 'password123',
        role: 'Client'
      });
    }

    // Wipe the current jobs collection
    await Job.deleteMany({});
    console.log('Cleared existing jobs collection.');

    const jobs = [
      // 12 Open Jobs
      { title: 'Vibrance Stage Lighting Automation', description: 'Need an IoT expert to map lighting to audio frequencies for the main stage.', jobType: 'Monetary', budget: 25000, requestedSkill: 'AWS', postedBy: user._id, status: 'Open', category: 'Web Dev' },
      { title: 'Technical Symposium Portal', description: 'Develop a fast React portal for symposium registrations.', jobType: 'Monetary', budget: 15000, requestedSkill: 'React', postedBy: user._id, status: 'Open', category: 'Web Dev' },
      { title: 'Marathon Tracking App', description: 'Flutter app for real-time tracking of runners during the campus marathon.', jobType: 'Monetary', budget: 18000, requestedSkill: 'Flutter', postedBy: user._id, status: 'Open', category: 'Web Dev' },
      { title: 'Cultural Fest Ticketing', description: 'Smart contract system for decentralized ticket sales.', jobType: 'Monetary', budget: 20000, requestedSkill: 'Solidity', postedBy: user._id, status: 'Open', category: 'Web Dev' },
      { title: 'Campus Navigation System', description: 'Python based graph algorithm for navigating campus blocks.', jobType: 'Monetary', budget: 8000, requestedSkill: 'Python', postedBy: user._id, status: 'Open', category: 'Web Dev' },
      { title: 'App UI Modernization', description: 'Redesign our legacy app UI into modern trends.', jobType: 'Monetary', budget: 4000, requestedSkill: 'Adobe XD', postedBy: user._id, status: 'Open', category: 'Design' },
      { title: 'Auditorium Booking API', description: 'REST API for booking auditoriums securely.', jobType: 'Monetary', budget: 6000, requestedSkill: 'Cybersecurity', postedBy: user._id, status: 'Open', category: 'Web Dev' },
      { title: 'Event Scraping Bot', description: 'Python script to scrape student activities and summarize them natively into a newsletter.', jobType: 'Monetary', budget: 2000, requestedSkill: 'Python', postedBy: user._id, status: 'Open', category: 'Writing' },
      { title: 'Food Court Ordering App', description: 'Flutter based order system for the tech park food court.', jobType: 'Monetary', budget: 22000, requestedSkill: 'Flutter', postedBy: user._id, status: 'Open', category: 'Web Dev' },
      { title: 'Cloud Data Migration', description: 'Migrate on-premise attendance data to AWS securely.', jobType: 'Monetary', budget: 12000, requestedSkill: 'AWS', postedBy: user._id, status: 'Open', category: 'Web Dev' },
      { title: 'Alumni Network Portal', description: 'React-driven social feed for alumni interactions.', jobType: 'Monetary', budget: 24000, requestedSkill: 'React', postedBy: user._id, status: 'Open', category: 'Web Dev' },
      { title: 'Smart Contract Whitepaper', description: 'Technical documentation and writeup for decentralized voting system logic.', jobType: 'Monetary', budget: 18000, requestedSkill: 'Writing', postedBy: user._id, status: 'Open', category: 'Writing' },
      
      // 2 In-Progress Jobs
      { title: 'Library Management Kiosk', description: 'Interactive interface for library catalog checking.', jobType: 'Monetary', budget: 10000, requestedSkill: 'React', postedBy: user._id, status: 'In Progress', category: 'Web Dev' },
      { title: 'Hostel Secure Log', description: 'Penetration testing and securing hostel in-out entry app.', jobType: 'Monetary', budget: 7000, requestedSkill: 'Cybersecurity', postedBy: user._id, status: 'In Progress', category: 'Web Dev' },
      
      // 1 Completed Job
      { title: 'Graphic Design for Fest', description: 'Designed post and banner for Riviera main acts.', jobType: 'Monetary', budget: 3500, requestedSkill: 'Adobe XD', postedBy: user._id, status: 'Completed', category: 'Design' },
    ];

    const inserted = await Job.insertMany(jobs);
    console.log(`Success! Inserted ${inserted.length} unique CampusPro Marketplace projects.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedJobs();
