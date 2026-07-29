const { Announcement, User, Notification } = require('../models');
const { uploadFile } = require('../utils/storage');

// Helper to create and send real-time notification
const sendNotification = async (app, userId, message, type) => {
  try {
    await Notification.create({ userId, message, type, isRead: false });
    const io = app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('notification', {
        message,
        type,
        createdAt: new Date()
      });
    }
  } catch (err) {
    console.error(err);
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const body = req.body || {};
    const { title, content, hostelBlock } = body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required for notice.' });
    }

    let photoUrl = null;
    if (req.file) {
      photoUrl = await uploadFile(req.file);
    } else if (body.photoUrl) {
      photoUrl = body.photoUrl;
    }

    const announcement = await Announcement.create({
      title,
      content,
      hostelBlock: hostelBlock || 'All',
      createdBy: req.userId,
      photoUrl
    });

    // Notify relevant students asynchronously
    try {
      const userQuery = { role: 'student', status: 'active' };
      if (hostelBlock && hostelBlock !== 'All') {
        userQuery.hostelBlock = hostelBlock;
      }
      const students = await User.findAll({ where: userQuery });
      const notificationPromises = students.map(student =>
        sendNotification(req.app, student.id, `New Announcement: "${title}"`, 'announcement')
      );
      await Promise.all(notificationPromises);
    } catch (notifErr) {
      console.error('Error sending announcement notifications:', notifErr);
    }

    res.status(201).json({
      message: 'Announcement posted successfully!',
      announcement
    });
  } catch (error) {
    console.error('Create Announcement Error:', error);
    res.status(500).json({ message: 'Internal server error posting announcement: ' + error.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    let whereQuery = {};

    if (req.userRole === 'student') {
      // Find student block
      const student = await User.findByPk(req.userId);
      whereQuery = {
        hostelBlock: ['All', student.hostelBlock]
      };
    }

    const announcements = await Announcement.findAll({
      where: whereQuery,
      include: [
        { model: User, as: 'creator', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Get Announcements Error:', error);
    res.status(500).json({ message: 'Internal server error fetching announcements.' });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const announcement = await Announcement.findByPk(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    await announcement.destroy();

    // Broadcast announcement deletion to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('announcement_deleted', Number(announcementId));
    }

    res.status(200).json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    console.error('Delete Announcement Error:', error);
    res.status(500).json({ message: 'Internal server error deleting announcement.' });
  }
};

