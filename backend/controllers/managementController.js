const { User, Complaint, Attendance, MessSkip, Setting, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// 1. Create Management Account (Admin only)
exports.createManagementAccount = async (req, res) => {
  try {
    const { name, email, password, phone, bio } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Name, email, password, and phone are required.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newManagementUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      bio: bio || 'Management Team Member',
      role: 'management',
      status: 'active'
    });

    return res.status(201).json({
      message: 'Management account created successfully!',
      user: {
        id: newManagementUser.id,
        name: newManagementUser.name,
        email: newManagementUser.email,
        role: newManagementUser.role,
        phone: newManagementUser.phone
      }
    });
  } catch (error) {
    console.error('Error creating management account:', error);
    return res.status(500).json({ message: 'Internal server error while creating management account.' });
  }
};

// 2. Get All Management Accounts
exports.getManagementAccounts = async (req, res) => {
  try {
    const accounts = await User.findAll({
      where: { role: 'management' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    return res.json(accounts);
  } catch (error) {
    console.error('Error fetching management accounts:', error);
    return res.status(500).json({ message: 'Failed to fetch management accounts.' });
  }
};

// 3. Delete / Terminate Management Account
exports.deleteManagementAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user || user.role !== 'management') {
      return res.status(404).json({ message: 'Management account not found.' });
    }
    await user.destroy();
    return res.json({ message: 'Management account deleted successfully.' });
  } catch (error) {
    console.error('Error deleting management account:', error);
    return res.status(500).json({ message: 'Failed to delete management account.' });
  }
};

// 4. Get Graphical Analytics (Day / Week / Month)
exports.getManagementAnalytics = async (req, res) => {
  try {
    const { period = 'week' } = req.query; // 'day', 'week', 'month'
    let daysToFetch = 7;
    if (period === 'day') daysToFetch = 1;
    if (period === 'month') daysToFetch = 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);

    // Complaint Breakdown
    const totalComplaints = await Complaint.count();
    const pendingComplaints = await Complaint.count({ where: { status: 'pending' } });
    const inProgressComplaints = await Complaint.count({ where: { status: { [Op.in]: ['assigned', 'in_progress'] } } });
    const resolvedComplaints = await Complaint.count({ where: { status: 'resolved' } });

    // Category Distribution
    const categories = ['plumbing', 'electrical', 'carpentry', 'cleaning', 'internet', 'other'];
    const categoryStats = {};
    for (const cat of categories) {
      categoryStats[cat] = await Complaint.count({ where: { category: cat } });
    }

    // Role Counts
    const studentCount = await User.count({ where: { role: 'student' } });
    const wardenCount = await User.count({ where: { role: 'warden' } });
    const staffCount = await User.count({ where: { role: 'staff' } });
    const managementCount = await User.count({ where: { role: 'management' } });

    // Time Series Trend Data (for Graphical Representation)
    const timeSeries = [];
    for (let i = daysToFetch - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayStart = new Date(d.setHours(0,0,0,0));
      const dayEnd = new Date(d.setHours(23,59,59,999));

      const complaintsCount = await Complaint.count({
        where: {
          createdAt: { [Op.between]: [dayStart, dayEnd] }
        }
      });

      const resolvedCount = await Complaint.count({
        where: {
          updatedAt: { [Op.between]: [dayStart, dayEnd] },
          status: 'resolved'
        }
      });

      timeSeries.push({
        date: dateStr,
        label: period === 'day' ? `${d.getHours()}:00` : dateStr.slice(5),
        complaints: complaintsCount,
        resolved: resolvedCount
      });
    }

    // Available Batches list
    const batchResults = await User.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('batch')), 'batch']],
      where: { role: 'student' },
      raw: true
    });
    const batches = batchResults.map(b => b.batch).filter(Boolean);

    return res.json({
      period,
      summary: {
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        studentCount,
        wardenCount,
        staffCount,
        managementCount
      },
      categoryStats,
      timeSeries,
      batches
    });
  } catch (error) {
    console.error('Error fetching management analytics:', error);
    return res.status(500).json({ message: 'Failed to fetch management analytics.' });
  }
};

// 5. Bulk Create Students from Excel/CSV JSON Data
exports.bulkCreateBatchFromExcel = async (req, res) => {
  try {
    const { students, batchName } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty student array provided.' });
    }

    const defaultPasswordHash = await bcrypt.hash('123456', 10);
    let createdCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const student of students) {
      const email = student.email || student.Email;
      const name = student.name || student.Name;
      const phone = student.phone || student.Phone || '0000000000';
      const rollNumber = student.rollNumber || student.RollNumber || student.RollNo || null;
      const roomNumber = student.roomNumber || student.RoomNumber || student.Room || null;
      const hostelBlock = student.hostelBlock || student.HostelBlock || student.Block || 'A';
      const gender = (student.gender || student.Gender || 'male').toLowerCase();

      if (!email || !name) {
        skippedCount++;
        errors.push(`Row missing name or email: ${JSON.stringify(student)}`);
        continue;
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        skippedCount++;
        continue;
      }

      await User.create({
        name,
        email,
        password: defaultPasswordHash,
        phone: String(phone),
        rollNumber: rollNumber ? String(rollNumber) : null,
        roomNumber: roomNumber ? String(roomNumber) : null,
        hostelBlock: String(hostelBlock),
        gender: gender.includes('female') ? 'female' : 'male',
        batch: batchName || student.batch || 'Batch 2025',
        role: 'student',
        status: 'active'
      });
      createdCount++;
    }

    return res.json({
      message: `Successfully processed batch! ${createdCount} students created, ${skippedCount} skipped.`,
      createdCount,
      skippedCount,
      errors
    });
  } catch (error) {
    console.error('Error during bulk student import:', error);
    return res.status(500).json({ message: 'Server error during bulk batch import.' });
  }
};

// 6. Terminate Single User
exports.terminateUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.status = 'blocked';
    await user.save();
    return res.json({ message: `User ${user.name} (${user.role}) has been terminated/blocked successfully.` });
  } catch (error) {
    console.error('Error terminating user:', error);
    return res.status(500).json({ message: 'Failed to terminate user.' });
  }
};

// 7. Terminate Entire Batch
exports.terminateBatch = async (req, res) => {
  try {
    const { batchName } = req.body;
    if (!batchName) {
      return res.status(400).json({ message: 'Batch name is required.' });
    }

    const [updatedCount] = await User.update(
      { status: 'blocked' },
      { where: { batch: batchName, role: 'student' } }
    );

    return res.json({
      message: `Batch "${batchName}" terminated successfully! Total ${updatedCount} student IDs blocked.`,
      terminatedCount: updatedCount
    });
  } catch (error) {
    console.error('Error terminating batch:', error);
    return res.status(500).json({ message: 'Failed to terminate batch.' });
  }
};
