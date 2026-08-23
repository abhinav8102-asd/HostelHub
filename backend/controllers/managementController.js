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
    const now = new Date();
    for (let i = daysToFetch - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

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
        label: period === 'day' ? `${d.getHours()}:00` : `${d.getDate()}/${d.getMonth()+1}`,
        complaints: complaintsCount || Math.max(totalComplaints, 1),
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
    return res.status(500).json({ message: 'Failed to fetch management analytics: ' + error.message });
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

    const targetBatch = (batchName || 'Batch 2025-2029').trim();

    for (let index = 0; index < students.length; index++) {
      const student = students[index];
      try {
        const rawName = student.name || student.Name || student.NAME || student['Student Name'] || `Student ${index + 1}`;
        const rawEmail = student.email || student.Email || student.EMAIL || student['Email Address'] || `student_${Date.now()}_${index}@hostelhub.com`;
        const rawPhone = student.phone || student.Phone || student.PHONE || student['Phone Number'] || student.Mobile || '9876543210';
        const rawRoll = student.rollNumber || student.RollNumber || student.ROLLNUMBER || student.RollNo || student['Roll No'] || student.Roll || `STU${100 + index}`;
        const rawRoom = student.roomNumber || student.RoomNumber || student.ROOMNUMBER || student.Room || student['Room No'] || `${101 + index}`;
        const rawBlock = student.hostelBlock || student.HostelBlock || student.HOSTELBLOCK || student.Block || 'Boys Hostel 1';
        const rawGender = String(student.gender || student.Gender || 'male').toLowerCase();

        const name = String(rawName).trim();
        const email = String(rawEmail).trim().toLowerCase();
        const phone = String(rawPhone).trim();
        const rollNumber = String(rawRoll).trim();
        const roomNumber = String(rawRoom).trim();
        const hostelBlock = String(rawBlock).trim();
        const gender = rawGender.includes('female') ? 'female' : 'male';

        // Check if email already exists
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
          skippedCount++;
          errors.push(`Row ${index + 1}: Email ${email} already exists`);
          continue;
        }

        // Check if roll number already exists
        if (rollNumber) {
          const existingRoll = await User.findOne({ where: { rollNumber } });
          if (existingRoll) {
            skippedCount++;
            errors.push(`Row ${index + 1}: Roll number ${rollNumber} already exists`);
            continue;
          }
        }

        await User.create({
          name,
          email,
          password: defaultPasswordHash,
          phone,
          rollNumber,
          roomNumber,
          hostelBlock,
          gender,
          batch: targetBatch,
          role: 'student',
          status: 'active'
        });
        createdCount++;
      } catch (rowErr) {
        console.error(`Error importing row ${index + 1}:`, rowErr);
        skippedCount++;
        errors.push(`Row ${index + 1}: ${rowErr.message}`);
      }
    }

    return res.json({
      message: `Batch "${targetBatch}" import complete! ${createdCount} students created successfully, ${skippedCount} skipped.`,
      createdCount,
      skippedCount,
      errors
    });
  } catch (error) {
    console.error('Error during bulk student import:', error);
    return res.status(500).json({ message: 'Server error during bulk batch import: ' + error.message });
  }
};

// 6. Terminate Single User
exports.terminateUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.status = 'blocked';
    await user.save();
    return res.json({ message: `User "${user.name}" (${user.role}) has been blocked/terminated successfully.` });
  } catch (error) {
    console.error('Error terminating user:', error);
    return res.status(500).json({ message: 'Failed to terminate user: ' + error.message });
  }
};

// 7. Terminate Entire Batch
exports.terminateBatch = async (req, res) => {
  try {
    const { batchName } = req.body;
    if (!batchName || !batchName.trim()) {
      return res.status(400).json({ message: 'Batch name is required.' });
    }

    const cleanBatch = batchName.trim();

    const [updatedCount] = await User.update(
      { status: 'blocked' },
      {
        where: {
          role: 'student',
          [Op.or]: [
            { batch: cleanBatch },
            { batch: { [Op.like]: `%${cleanBatch}%` } }
          ]
        }
      }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: `No active students found in batch matching "${cleanBatch}".` });
    }

    return res.json({
      message: `Batch "${cleanBatch}" terminated successfully! Total ${updatedCount} student IDs blocked.`,
      terminatedCount: updatedCount
    });
  } catch (error) {
    console.error('Error terminating batch:', error);
    return res.status(500).json({ message: 'Failed to terminate batch: ' + error.message });
  }
};
