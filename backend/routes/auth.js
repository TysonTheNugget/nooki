const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Import the User model
const router = express.Router();

// Hard-coded JWT secret key
const JWT_SECRET = 'mySuperSecretKey12345!';

// @route   POST /api/auth/register
// @desc    Register a new user and return a token
// @access  Public
router.post('/register', async (req, res) => {
  const { username, password, twitterHandle } = req.body;

  try {
    let user = await User.findOne({ username });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      username,
      password,
      twitterHandle,
    });

    // Hash the password before saving it
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Ensure the user has an _id field
    const payload = {
      user: {
        id: user._id  // MongoDB uses _id as the identifier
      }
    };

    // Generate the JWT
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, message: 'User registered successfully' });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and return token
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Payload for JWT
    const payload = {
      user: {
        id: user._id  // MongoDB uses _id as the identifier
      }
    };

    // Generate the JWT
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, message: 'Login successful' });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
