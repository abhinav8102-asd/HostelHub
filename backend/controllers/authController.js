const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, roomNumber, hostelBlock } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered!' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: passwordHash,
      role: role || 'student',
      phone,
      roomNumber: role === 'student' ? roomNumber : null,
      hostelBlock: role === 'student' || role === 'warden' ? hostelBlock : null,
      status: 'active'
    });

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials! Email not found.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Your account is currently inactive. Contact Admin.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials! Wrong password.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'hostelhub_secret_key_12345',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        roomNumber: user.roomNumber,
        hostelBlock: user.hostelBlock,
        bio: user.bio,
        profilePicUrl: user.profilePicUrl
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Internal server error retrieving profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, bio } = req.body;
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;

    if (req.file) {
      user.profilePicUrl = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        roomNumber: user.roomNumber,
        hostelBlock: user.hostelBlock,
        bio: user.bio,
        profilePicUrl: user.profilePicUrl
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Internal server error updating profile.' });
  }
};
