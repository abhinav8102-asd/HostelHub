const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const { User, PasswordResetOTP } = require('../models');
const { OAuth2Client } = require('google-auth-library');
const { uploadFile } = require('../utils/storage');
require('dotenv').config();

// Setup Nodemailer transporter with stripped App Password for 100% Gmail authentication
const rawEmailPass = process.env.EMAIL_PASSWORD || 'qmvhwedjipeyqstm';
const cleanEmailPass = rawEmailPass.replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'hostelhub.rvsofficial@gmail.com',
    pass: cleanEmailPass
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
    const { email, loginId, userId, password } = req.body;
    const loginInput = (email || loginId || userId || '').trim();

    if (!loginInput || !password) {
      return res.status(400).json({ message: 'User ID / Gmail and password are required.' });
    }

    // Find user by Email OR Roll Number / User ID
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: loginInput },
          { rollNumber: loginInput }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials! User ID or Email not found.' });
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
        gender: user.gender,
        batch: user.batch,
        rollNumber: user.rollNumber,
        status: user.status,
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

exports.sendRegistrationOTP = async (req, res) => {
  const startTime = Date.now();
  try {
    const { email } = req.body;
    console.log(`\n🔍 [OTP DEBUG STEP 1] Received sendRegistrationOTP request for email: "${email}" at ${new Date().toISOString()}`);

    if (!email) {
      console.log(`❌ [OTP DEBUG STEP 1 ERROR] Gmail address missing in request body.`);
      return res.status(400).json({ message: 'Gmail address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existingEmail = await User.findOne({ where: { email: cleanEmail } });
    if (existingEmail) {
      console.log(`⚠️ [OTP DEBUG STEP 2] Gmail address "${cleanEmail}" is already registered in DB.`);
      return res.status(400).json({ message: 'This Gmail address is already registered in HostelHub!' });
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes duration

    // Save to PasswordResetOTP table
    await PasswordResetOTP.create({ email: cleanEmail, otp, expiresAt });
    console.log(`🔑 [OTP DEBUG STEP 3] OTP Record created in DB for ${cleanEmail}: ${otp} (Duration: ${Date.now() - startTime}ms)`);

    const mailOptions = {
      from: `"HostelHub Support" <${process.env.EMAIL_USER || 'hostelhub.rvsofficial@gmail.com'}>`,
      to: cleanEmail,
      subject: 'HostelHub - Registration Gmail Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px; margin: 0 auto; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 26px;">🏨 HostelHub</h1>
            <span style="color: #64748b; font-size: 13px;">Official Student Account Registration</span>
          </div>
          <p style="color: #334155; font-size: 15px;">Hello,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">Thank you for registering on HostelHub! Please enter the 6-digit Gmail verification code below to verify your email address:</p>
          <div style="background-color: #eff6ff; border: 2px dashed #2563eb; text-align: center; padding: 18px; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #1d4ed8; border-radius: 10px; margin: 24px 0;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 12.5px; text-align: center;">This code will expire in <strong>15 minutes</strong>. If you did not initiate this registration, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
          <p style="text-align: center; color: #94a3b8; font-size: 11px;">© 2026 HostelHub System Support • hostelhub.rvsofficial@gmail.com</p>
        </div>
      `
    };

    // Send email directly via Nodemailer (same as successful test script)
    try {
      console.log(`🚀 [OTP DEBUG STEP 4] Transmitting Nodemailer Gmail SMTP email to ${cleanEmail}...`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ [OTP DEBUG STEP 5] Gmail OTP Email DELIVERED SUCCESSFULLY to ${cleanEmail}! MessageID: ${info.messageId}`);
    } catch (mailErr) {
      console.error(`❌ [OTP DEBUG STEP 5 ERROR] Nodemailer sendRegistrationOTP Error:`, mailErr);
    }

    return res.status(200).json({ message: 'Verification OTP sent to your Gmail inbox!', email: cleanEmail });
  } catch (error) {
    console.error(`❌ [OTP DEBUG CRITICAL ERROR] Send Registration OTP Exception:`, error);
    return res.status(500).json({ message: 'Internal server error sending registration OTP.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, identifier } = req.body;
    const searchInput = (email || identifier || '').trim().toLowerCase();
    if (!searchInput) {
      return res.status(400).json({ message: 'User ID / Roll No or Gmail address is required.' });
    }

    // Find user by email OR roll number / user ID
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: searchInput },
          { rollNumber: searchInput }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'No registered user found with this User ID or Gmail.' });
    }

    const targetEmail = user.email;

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes duration

    await PasswordResetOTP.create({ email: targetEmail, otp, expiresAt });
    console.log(`🔑 FORGOT PASSWORD OTP FOR ${targetEmail}: ${otp}`);

    const mailOptions = {
      from: `"HostelHub Support" <${process.env.EMAIL_USER || 'hostelhub.rvsofficial@gmail.com'}>`,
      to: targetEmail,
      subject: 'HostelHub - Password Reset OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px; margin: 0 auto; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 26px;">🏨 HostelHub</h1>
            <span style="color: #64748b; font-size: 13px;">Password Reset & Account Security</span>
          </div>
          <p style="color: #334155; font-size: 15px;">Hello ${user.name},</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">We received a request to reset your HostelHub password. Use the verification code below to reset your password:</p>
          <div style="background-color: #eff6ff; border: 2px dashed #2563eb; text-align: center; padding: 18px; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #1d4ed8; border-radius: 10px; margin: 24px 0;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 12.5px; text-align: center;">This code will expire in <strong>15 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
          <p style="text-align: center; color: #94a3b8; font-size: 11px;">© 2026 HostelHub System Support • hostelhub.rvsofficial@gmail.com</p>
        </div>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Forgot Password OTP Email sent successfully to:', targetEmail, info.messageId);
    } catch (mailErr) {
      console.error('Nodemailer forgotPassword Error:', mailErr);
    }

    return res.status(200).json({ message: 'OTP verification code sent successfully to your registered Gmail!', email: targetEmail });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ message: 'Internal server error during password reset request.' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const record = await PasswordResetOTP.findOne({
      where: { email: cleanEmail, otp: cleanOtp },
      order: [['createdAt', 'DESC']]
    });

    if (!record) {
      return res.status(400).json({ message: 'Invalid 6-digit verification code. Please check your Gmail inbox.' });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ message: 'Verification code has expired. Click Resend for a new code.' });
    }

    res.status(200).json({ message: 'Gmail code verified successfully!' });
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
