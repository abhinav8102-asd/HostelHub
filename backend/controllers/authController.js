const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User, PasswordResetOTP } = require('../models');
const { OAuth2Client } = require('google-auth-library');
const { uploadFile } = require('../utils/storage');
require('dotenv').config();

// Setup Nodemailer transporter with dynamic environment values (free Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, roomNumber, hostelBlock, gender, batch, rollNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered!' });
    }

    // Check if roll number already exists for students
    if (role === 'student' || !role) {
      if (!rollNumber) {
        return res.status(400).json({ message: 'Roll number is required for students!' });
      }
      const existingRoll = await User.findOne({ where: { rollNumber } });
      if (existingRoll) {
        return res.status(400).json({ message: 'Roll number is already registered!' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userRole = role || 'student';

    // Create user
    const user = await User.create({
      name,
      email,
      password: passwordHash,
      role: userRole,
      phone,
      roomNumber: userRole === 'student' ? roomNumber : null,
      hostelBlock: userRole === 'student' || userRole === 'warden' ? hostelBlock : null,
      gender: gender || 'male',
      batch: userRole === 'student' ? (batch || 'Batch 2025') : null,
      rollNumber: userRole === 'student' ? rollNumber : null,
      status: userRole === 'student' ? 'pending_verification' : 'active'
    });

    res.status(201).json({
      message: userRole === 'student' 
        ? 'Registration successful! Waiting for Warden verification.' 
        : 'User registered successfully!',
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

    // Custom messages based on verification status
    if (user.status === 'pending_verification') {
      return res.status(403).json({ message: 'Registration pending. Waiting for Warden approval.' });
    }
    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked. Contact Warden/Admin.' });
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
    const { name, phone, bio, email, hostelBlock, roomNumber, rollNumber, gender, batch } = req.body;
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let requiresReapproval = false;

    // Critical fields check: ONLY Gender or Academic Batch require Warden re-approval
    if (gender && gender !== user.gender) {
      user.gender = gender;
      requiresReapproval = true;
    }
    if (batch && batch !== user.batch) {
      user.batch = batch;
      requiresReapproval = true;
    }

    if (hostelBlock) user.hostelBlock = hostelBlock;
    if (rollNumber && rollNumber !== user.rollNumber) {
      const existingRoll = await User.findOne({ where: { rollNumber } });
      if (existingRoll && existingRoll.id !== user.id) {
        return res.status(400).json({ message: 'This Roll Number is already registered.' });
      }
      user.rollNumber = rollNumber;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail && existingEmail.id !== user.id) {
        return res.status(400).json({ message: 'This Email address is already in use.' });
      }
      user.email = email;
    }
    if (roomNumber) user.roomNumber = roomNumber;
    if (bio !== undefined) user.bio = bio;

    if (req.file) {
      user.profilePicUrl = await uploadFile(req.file);
    }

    if (requiresReapproval && user.role === 'student') {
      user.status = 'pending_verification';
    }

    await user.save();

    res.status(200).json({
      message: requiresReapproval 
        ? 'Profile updated! Because critical data (Gender/Batch) was changed, your account is now pending Warden re-approval.' 
        : 'Profile updated successfully!',
      requiresReapproval,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        roomNumber: user.roomNumber,
        hostelBlock: user.hostelBlock,
        gender: user.gender,
        batch: user.batch,
        rollNumber: user.rollNumber,
        status: user.status,
        bio: user.bio,
        profilePicUrl: user.profilePicUrl
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Internal server error updating profile.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No registered user found with this email.' });
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes duration

    // Save to PasswordResetOTP table
    await PasswordResetOTP.create({ email, otp, expiresAt });

    // Send email via Nodemailer SMTP (uses Gmail App Password)
    const mailOptions = {
      from: `"HostelHub Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'HostelHub - Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #4f46e5; text-align: center;">HostelHub Password Reset</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Use the verification code below to complete the reset process:</p>
          <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #111827; border-radius: 6px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 13px;">This code is valid for <strong>5 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="text-align: center; color: #9ca3af; font-size: 11px;">🏨 HostelHub Management System</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Nodemailer sendMail Error:', error);
        return res.status(500).json({ message: 'Failed to send OTP code to email. Please verify SMTP credentials.' });
      }
      res.status(200).json({ message: 'OTP verification code sent successfully to your email!' });
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Internal server error during password reset request.' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    const record = await PasswordResetOTP.findOne({
      where: { email, otp },
      order: [['createdAt', 'DESC']]
    });

    if (!record) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ message: 'Verification code has expired. Request a new one.' });
    }

    res.status(200).json({ message: 'Code verified successfully!' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Internal server error verifying code.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, code, and new password are required.' });
    }

    const record = await PasswordResetOTP.findOne({
      where: { email, otp },
      order: [['createdAt', 'DESC']]
    });

    if (!record || new Date() > record.expiresAt) {
      return res.status(400).json({ message: 'Session expired or invalid code.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.password = passwordHash;
    await user.save();

    await PasswordResetOTP.destroy({ where: { email } });

    res.status(200).json({ message: 'Password has been reset successfully! You can now log in.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Internal server error resetting password.' });
  }
};
