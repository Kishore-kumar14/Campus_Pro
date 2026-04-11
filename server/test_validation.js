const mongoose = require('mongoose');
const User = require('./models/User');

const testEmails = [
  'demo@test.com',
  'user@vit.ac.in',
  'student@mit.edu',
  'invalid@gmail.com'
];

testEmails.forEach(email => {
  const user = new User({
    fullName: 'Test User',
    email: email,
    password: 'password123'
  });

  const error = user.validateSync();
  if (error) {
    console.log(`Email: ${email} -> INVALID:`, error.errors.email?.message || error.message);
  } else {
    console.log(`Email: ${email} -> VALID`);
  }
});
