const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const User = require('../models/User');

const router = express.Router();

// AWS SES Client setup
// Assuming AWS credentials are set in environment variables or standard AWS config
const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, skills } = req.body;
    if (!fullName) return res.status(400).json({ error: 'Full name is required.' });

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Regex check for institutional domain (.edu or .ac.in)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in)$/i;
    
    if (!emailRegex.test(email)) {
       return res.status(400).json({ 
         error: 'Invalid email domain. Only .edu or .ac.in emails are allowed.' 
       });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create verification token replacing crypto with JWT
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    const verificationToken = jwt.sign({ email }, jwtSecret, { expiresIn: '1d' });

    // Save user with isVerified: false
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'Student',
      skills: skills || [],
      isVerified: false,
      verificationToken
    });

    await newUser.save();

    // Send verification email via AWS SES
    const verificationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/verify?token=${verificationToken}`;
    
    const sendEmailCommand = new SendEmailCommand({
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<p>Welcome to CampusPro!</p>
                   <p>Please verify your student account by clicking the following link:</p>
                   <a href="${verificationLink}">${verificationLink}</a>`,
          },
          Text: {
            Charset: "UTF-8",
            Data: `Welcome to CampusPro! Please verify your student account by navigating to: ${verificationLink}`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Verify your CampusPro Student Account",
        },
      },
      Source: process.env.SES_SENDER_EMAIL || "noreply@campuspro.com",
    });

    // In a development environment without AWS credentials, this will fail.
    // Wrap in a try-catch so it doesn't break registration if SES isn't configured locally.
    try {
      await sesClient.send(sendEmailCommand);
    } catch (sesError) {
      console.warn("Failed to send SES email. Ensure AWS credentials are set.", sesError.message);
      // For local development, we might not have SES configured. We can still log the token.
      console.log(`[LOCAL DEV] Verification link: ${verificationLink}`);
    }

    res.status(201).json({ 
      message: 'Registration successful. Please check your email for the verification link.',
      user: {
        id: newUser._id,
        email: newUser.email,
        isVerified: newUser.isVerified
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Token is required.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findOne({ email: decoded.email, verificationToken: token });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`);
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    const token = jwt.sign(
      { id: user._id, fullName: user.fullName, email: user.email, role: user.role, skills: user.skills },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      role: user.role, 
      fullName: user.fullName 
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
