const { User, Complaint, Announcement, Notification } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

exports.getStaffList = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: { role: 'staff', status: 'active' },
      attributes: ['id', 'name', 'phone']
    });
    res.status(200).json(staff);
  } catch (error) {
    console.error('Get Staff List Error:', error);
    res.status(500).json({ message: 'Internal server error retrieving staff list.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Internal server error retrieving users.' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'active' or 'inactive'

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({ message: `User status updated to ${status}.`, user: { id: user.id, name: user.name, status: user.status } });
  } catch (error) {
    console.error('Update User Status Error:', error);
    res.status(500).json({ message: 'Internal server error updating user status.' });
  }
};

exports.createWardenOrStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!['warden', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Role must be warden or staff.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered!' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: passwordHash,
      role,
      phone,
      status: 'active'
    });

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ message: 'Internal server error creating user.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Clean up dependent records to prevent database foreign key constraint errors
    await Notification.destroy({ where: { userId } });
    await Announcement.destroy({ where: { createdBy: userId } });
    await Complaint.destroy({
      where: {
        [Op.or]: [
          { studentId: userId },
          { wardenId: userId },
          { staffId: userId }
        ]
      }
    });

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Internal server error deleting user.' });
  }
};

exports.getWardenList = async (req, res) => {
  try {
    const wardens = await User.findAll({
      where: { role: 'warden', status: 'active' },
      attributes: ['id', 'name', 'phone', 'email', 'profilePicUrl', 'bio', 'hostelBlock']
    });
    res.status(200).json(wardens);
  } catch (error) {
    console.error('Get Warden List Error:', error);
    res.status(500).json({ message: 'Internal server error retrieving warden list.' });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const warden = await User.findByPk(req.userId);
    if (!warden) {
      return res.status(404).json({ message: 'Warden account not found.' });
    }

    let filter = {
      role: 'student',
      status: 'pending_verification'
    };

    if (warden.role === 'warden') {
      if (!warden.hostelBlock) {
        return res.status(200).json([]);
      }
      filter.hostelBlock = warden.hostelBlock;
    }

    const pending = await User.findAll({
      where: filter,
      attributes: ['id', 'name', 'email', 'phone', 'rollNumber', 'roomNumber', 'hostelBlock', 'batch', 'gender', 'createdAt']
    });

    res.status(200).json(pending);
  } catch (error) {
    console.error('Get Pending Approvals Error:', error);
    res.status(500).json({ message: 'Internal server error retrieving pending approvals.' });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.status = 'active';
    await user.save();

    res.status(200).json({ message: 'Student approved successfully!', userId: user.id });
  } catch (error) {
    console.error('Approve User Error:', error);
    res.status(500).json({ message: 'Internal server error approving student.' });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await user.destroy();
    res.status(200).json({ message: 'Student registration request rejected and deleted.', userId });
  } catch (error) {
    console.error('Reject User Error:', error);
    res.status(500).json({ message: 'Internal server error rejecting student.' });
  }
};


