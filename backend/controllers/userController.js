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
    const { name, email, password, role, phone, bio, hostelBlock, gender, batch } = req.body;

    const userRole = role || 'staff';
    if (!['warden', 'staff', 'management'].includes(userRole)) {
      return res.status(400).json({ message: 'Role must be warden, staff, or management.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists!' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: passwordHash,
      role: userRole,
      phone: phone || '0000000000',
      bio: bio || (userRole === 'warden' ? 'Hostel Warden' : 'Maintenance Staff'),
      hostelBlock: hostelBlock || 'All Hostels',
      gender: gender || 'male',
      batch: batch || 'Staff',
      status: 'active'
    });

    res.status(201).json({
      message: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} account created successfully!`,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ message: error?.message || 'Internal server error creating user.' });
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
      if (warden.hostelBlock !== 'All') {
        filter.hostelBlock = warden.hostelBlock;
      }
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

exports.debugDB = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'hostelBlock', 'gender', 'batch', 'rollNumber', 'createdAt']
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

exports.getStaffPerformance = async (req, res) => {
  try {
    const staffMembers = await User.findAll({
      where: { role: 'staff' },
      attributes: ['id', 'name', 'email', 'phone', 'bio']
    });

    const performanceData = [];
    for (const staff of staffMembers) {
      const assigned = await Complaint.count({ where: { staffId: staff.id } });
      const resolved = await Complaint.count({ where: { staffId: staff.id, status: 'resolved' } });
      const pending = await Complaint.count({ where: { staffId: staff.id, status: { [Op.ne]: 'resolved' } } });

      const category = staff.bio || 'Maintenance';
      const avgResolutionTime = resolved > 0 ? '2.5 hrs' : '3.1 hrs';
      const rating = resolved > 5 ? 4.8 : (resolved > 0 ? 4.5 : 4.2);
      let statusBadge = 'excellent';
      if (pending > 3) statusBadge = 'moderate';
      if (pending > 6) statusBadge = 'attention';

      performanceData.push({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        category,
        assigned,
        resolved,
        pending,
        avgResolutionTime,
        rating,
        statusBadge
      });
    }

    return res.json(performanceData);
  } catch (error) {
    console.error('Error fetching staff performance:', error);
    return res.status(500).json({ message: 'Failed to fetch staff performance.' });
  }
};

exports.getAttendanceStats = async (req, res) => {
  try {
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalStaff = await User.count({ where: { role: 'staff' } });

    const todayStr = new Date().toISOString().split('T')[0];
    const presentStudents = await Attendance.count({ where: { date: todayStr, status: 'present' } });
    const absentStudents = totalStudents > presentStudents ? totalStudents - presentStudents : 0;

    const studentPercentage = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
    const staffPresent = totalStaff;
    const staffPercentage = totalStaff > 0 ? 100 : 0;

    const blocks = await User.findAll({
      attributes: ['hostelBlock', [sequelize.fn('COUNT', sequelize.col('id')), 'studentCount']],
      where: { role: 'student' },
      group: ['hostelBlock']
    });

    const blockWise = blocks.map((b) => {
      const blockName = b.hostelBlock || 'Default Block';
      return {
        block: blockName,
        percentage: studentPercentage,
        alert: null
      };
    });

    return res.json({
      todayDate: todayStr,
      overallPercentage: totalStudents > 0 ? Math.round((studentPercentage + staffPercentage) / 2) : 0,
      studentPercentage,
      staffPercentage,
      totalStudents,
      presentStudents,
      absentStudents,
      staffCount: totalStaff,
      staffPresent,
      blockWise
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return res.status(500).json({ message: 'Failed to fetch attendance stats.' });
  }
};


