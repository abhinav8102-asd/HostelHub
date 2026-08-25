const { User, Attendance } = require('../models');

// 1. Get List of Students for Roll Call (Warden / Admin)
exports.getStudentsList = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student', status: 'active' },
      attributes: ['id', 'name', 'email', 'roomNumber', 'hostelBlock', 'phone'],
      order: [['roomNumber', 'ASC']]
    });
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students list:', error);
    res.status(500).json({ message: 'Error retrieving student list.' });
  }
};

// 2. Bulk Mark Attendance (Warden / Admin)
exports.markBulkAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;
    const markedBy = req.userId;

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Date and records array are required.' });
    }

    for (const record of records) {
      const { studentId, status, remarks } = record;
      
      // Find existing attendance for that student and date
      const existing = await Attendance.findOne({
        where: { studentId, date }
      });

      if (existing) {
        existing.status = status;
        existing.markedBy = markedBy;
        existing.remarks = remarks !== undefined ? remarks : existing.remarks;
        await existing.save();
      } else {
        await Attendance.create({
          studentId,
          date,
          status,
          markedBy,
          remarks
        });
      }
    }

    res.status(200).json({ message: 'Attendance marked successfully!' });
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    res.status(500).json({ message: 'Error marking attendance.' });
  }
};

// 3. Get Attendance Summary/Report for a specific Date (Warden / Admin)
exports.getDailyAttendanceSummary = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required.' });
    }

    const attendances = await Attendance.findAll({
      where: { date },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'roomNumber', 'hostelBlock']
        }
      ]
    });

    res.status(200).json(attendances);
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    res.status(500).json({ message: 'Error retrieving daily summary.' });
  }
};

// 4. Get Student Statistics (Student only)
exports.getStudentStats = async (req, res) => {
  try {
    const studentId = req.userId;

    const attendances = await Attendance.findAll({
      where: { studentId },
      order: [['date', 'DESC']]
    });

    const summary = {
      total: attendances.length,
      present: 0,
      absent: 0,
      outing: 0,
      percentage: 0
    };

    attendances.forEach(a => {
      if (a.status === 'present') summary.present++;
      else if (a.status === 'absent') summary.absent++;
      else if (a.status === 'outing') summary.outing++;
    });

    // Percentage of attendance (present / (total - outings) or simply present / total, let's do present / total for standard percentage)
// 5. Get Monthly Attendance Report for all Students (Admin / Warden)
exports.getMonthlyAttendanceReport = async (req, res) => {
  try {
    const { month } = req.query; // Format: 'YYYY-MM' e.g. '2026-08'
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const { Op } = require('sequelize');

    const students = await User.findAll({
      where: { role: 'student', status: 'active' },
      attributes: ['id', 'name', 'email', 'roomNumber', 'hostelBlock', 'batch'],
      order: [['name', 'ASC']]
    });

    const monthAttendances = await Attendance.findAll({
      where: {
        date: {
          [Op.like]: `${targetMonth}%`
        }
      }
    });

    const report = students.map(student => {
      const studentRecords = monthAttendances.filter(a => a.studentId === student.id);
      const presentDays = studentRecords.filter(a => a.status === 'present').length;
      const absentDays = studentRecords.filter(a => a.status === 'absent').length;
      const outingDays = studentRecords.filter(a => a.status === 'outing').length;
      const recordedDays = studentRecords.length;
      const percentage = recordedDays > 0 ? Math.round((presentDays / recordedDays) * 100) : 100;

      return {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          roomNumber: student.roomNumber,
          hostelBlock: student.hostelBlock,
          batch: student.batch
        },
        presentDays,
        absentDays,
        outingDays,
        recordedDays,
        percentage
      };
    });

    res.status(200).json({
      month: targetMonth,
      totalStudents: students.length,
      report
    });
  } catch (error) {
    console.error('Error fetching monthly attendance report:', error);
    res.status(500).json({ message: 'Error generating monthly attendance report.' });
  }
};
