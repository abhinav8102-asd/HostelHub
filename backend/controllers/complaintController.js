const { Complaint, User, Notification } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { uploadFile } = require('../utils/storage');

// Helper to create and send real-time notification
const sendNotification = async (app, userId, message, type) => {
  try {
    // Save to DB
    await Notification.create({
      userId,
      message,
      type,
      isRead: false
    });

    // Emit live socket event if io is configured
    const io = app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('notification', {
        message,
        type,
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

exports.raiseComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const photoUrl = req.file ? await uploadFile(req.file) : null;

    const complaint = await Complaint.create({
      studentId: req.userId,
      title,
      description,
      category,
      priority: priority || 'medium',
      status: 'pending',
      photoUrl
    });

    // Notify all wardens
    const wardens = await User.findAll({ where: { role: 'warden', status: 'active' } });
    const notificationPromises = wardens.map(warden => 
      sendNotification(req.app, warden.id, `[${(priority || 'medium').toUpperCase()}] New complaint: "${title}" by student`, 'complaint_update')
    );
    await Promise.all(notificationPromises);

    res.status(201).json({
      message: 'Complaint registered successfully!',
      complaint
    });
  } catch (error) {
    console.error('Raise Complaint Error:', error);
    res.status(500).json({ message: 'Internal server error while raising complaint.' });
  }
};

exports.getStudentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      where: { studentId: req.userId },
      include: [
        { model: User, as: 'staff', attributes: ['name', 'phone'] },
        { model: User, as: 'warden', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Get Student Complaints Error:', error);
    res.status(500).json({ message: 'Internal server error fetching complaints.' });
  }
};

exports.getWardenComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      include: [
        { model: User, as: 'student', attributes: ['name', 'phone', 'roomNumber', 'hostelBlock'] },
        { model: User, as: 'staff', attributes: ['id', 'name', 'phone'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Get Warden Complaints Error:', error);
    res.status(500).json({ message: 'Internal server error fetching complaints.' });
  }
};

exports.getStaffComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      where: { staffId: req.userId },
      include: [
        { model: User, as: 'student', attributes: ['name', 'phone', 'roomNumber', 'hostelBlock'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Get Staff Complaints Error:', error);
    res.status(500).json({ message: 'Internal server error fetching staff complaints.' });
  }
};

exports.assignComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { staffId } = req.body;

    const complaint = await Complaint.findByPk(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    const staff = await User.findOne({ where: { id: staffId, role: 'staff' } });
    if (!staff) {
      return res.status(400).json({ message: 'Invalid staff member selected.' });
    }

    complaint.staffId = staffId;
    complaint.wardenId = req.userId;
    complaint.status = 'assigned';
    await complaint.save();

    // Notify Student
    await sendNotification(
      req.app, 
      complaint.studentId, 
      `Your complaint "${complaint.title}" has been assigned to ${staff.name} (${staff.phone}).`, 
      'assignment'
    );

    // Notify Staff member
    await sendNotification(
      req.app, 
      staffId, 
      `New task assigned: "${complaint.title}".`, 
      'assignment'
    );

    res.status(200).json({
      message: 'Complaint assigned successfully!',
      complaint
    });
  } catch (error) {
    console.error('Assign Complaint Error:', error);
    res.status(500).json({ message: 'Internal server error assigning complaint.' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body; // 'in_progress' or 'resolved'
    const completionPhotoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!['in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update. Must be in_progress or resolved.' });
    }

    const complaint = await Complaint.findOne({ where: { id: complaintId, staffId: req.userId } });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found or not assigned to you.' });
    }

    complaint.status = status;
    if (status === 'resolved') {
      if (completionPhotoUrl) {
        complaint.completionPhotoUrl = completionPhotoUrl;
      }
    }
    await complaint.save();

    // Notify Student
    await sendNotification(
      req.app,
      complaint.studentId,
      `Your complaint "${complaint.title}" status updated to ${status.replace('_', ' ')}.`,
      'complaint_update'
    );

    // Notify Staff member themselves
    await sendNotification(
      req.app,
      req.userId,
      `You marked complaint "${complaint.title}" as ${status.replace('_', ' ')}.`,
      'complaint_update'
    );

    // Notify Wardens
    const wardens = await User.findAll({ where: { role: 'warden', status: 'active' } });
    const notificationPromises = wardens.map(warden => 
      sendNotification(
        req.app, 
        warden.id, 
        `Complaint "${complaint.title}" updated to ${status.replace('_', ' ')} by staff.`, 
        'complaint_update'
      )
    );
    await Promise.all(notificationPromises);

    res.status(200).json({
      message: `Complaint marked as ${status.replace('_', ' ')}!`,
      complaint
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: 'Internal server error updating complaint status.' });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { rating, comment } = req.body;

    const complaint = await Complaint.findOne({ where: { id: complaintId, studentId: req.userId } });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    if (complaint.status !== 'resolved') {
      return res.status(400).json({ message: 'Feedback can only be provided on resolved complaints.' });
    }

    complaint.feedbackRating = rating;
    complaint.feedbackComment = comment;
    await complaint.save();

    // Notify Warden (if exists)
    if (complaint.wardenId) {
      await sendNotification(
        req.app,
        complaint.wardenId,
        `Student gave ${rating} stars rating for resolved complaint: "${complaint.title}".`,
        'complaint_update'
      );
    }

    res.status(200).json({
      message: 'Feedback submitted successfully!',
      complaint
    });
  } catch (error) {
    console.error('Add Feedback Error:', error);
    res.status(500).json({ message: 'Internal server error adding feedback.' });
  }
};

exports.getComplaintDetails = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findByPk(complaintId, {
      include: [
        { model: User, as: 'student', attributes: ['name', 'phone', 'roomNumber', 'hostelBlock'] },
        { model: User, as: 'staff', attributes: ['name', 'phone'] },
        { model: User, as: 'warden', attributes: ['name'] }
      ]
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Role specific access control
    if (req.userRole === 'student' && complaint.studentId !== req.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (req.userRole === 'staff' && complaint.staffId !== req.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.status(200).json(complaint);
  } catch (error) {
    console.error('Get Complaint Details Error:', error);
    res.status(500).json({ message: 'Internal server error fetching details.' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const total = await Complaint.count();
    const pending = await Complaint.count({ where: { status: 'pending' } });
    const assigned = await Complaint.count({ where: { status: 'assigned' } });
    const inProgress = await Complaint.count({ where: { status: 'in_progress' } });
    const resolved = await Complaint.count({ where: { status: 'resolved' } });

    // Category Breakdown
    const categories = ['electrical', 'plumbing', 'carpentry', 'cleaning', 'wifi', 'others'];
    const categoryCount = {};
    for (const cat of categories) {
      categoryCount[cat] = await Complaint.count({ where: { category: cat } });
    }

    // Priority Breakdown
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const priorityCount = {};
    for (const p of priorities) {
      priorityCount[p] = await Complaint.count({ where: { priority: p } });
    }

    res.status(200).json({
      summary: { total, pending, assigned, inProgress, resolved },
      categories: categoryCount,
      priorities: priorityCount
    });
  } catch (error) {
    console.error('Get Analytics Error:', error);
    res.status(500).json({ message: 'Internal server error fetching analytics.' });
  }
};

// Returns active workload per staff member for warden's assign dropdown
exports.getStaffWorkload = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: { role: 'staff', status: 'active' },
      attributes: ['id', 'name', 'phone']
    });

    const workload = await Promise.all(staff.map(async (s) => {
      const activeCount = await Complaint.count({
        where: { staffId: s.id, status: ['assigned', 'in_progress'] }
      });
      const totalCount = await Complaint.count({ where: { staffId: s.id } });
      return {
        id: s.id,
        name: s.name,
        phone: s.phone,
        activeCount,
        totalCount
      };
    }));

    res.status(200).json(workload);
  } catch (error) {
    console.error('Get Staff Workload Error:', error);
    res.status(500).json({ message: 'Internal server error fetching workload.' });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findByPk(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Role specific access control: Warden and Admin can delete
    if (req.userRole !== 'warden' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only wardens or admins can delete complaints.' });
    }

    // Unlink original attachment file if it exists
    if (complaint.photoUrl) {
      const filePath = path.join(__dirname, '..', complaint.photoUrl);
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error('Failed to delete photo:', unlinkErr);
          });
        }
      });
    }

    // Unlink completion proof file if it exists
    if (complaint.completionPhotoUrl) {
      const filePath = path.join(__dirname, '..', complaint.completionPhotoUrl);
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error('Failed to delete completion photo:', unlinkErr);
          });
        }
      });
    }

    await complaint.destroy();
    res.status(200).json({ message: 'Complaint deleted successfully.' });
  } catch (error) {
    console.error('Delete Complaint Error:', error);
    res.status(500).json({ message: 'Internal server error deleting complaint.' });
  }
};


