const { Notification } = require('../models');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ message: 'Internal server error fetching notifications.' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.userId, isRead: false } }
    );
    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark Notifications Read Error:', error);
    res.status(500).json({ message: 'Internal server error updating notifications.' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOne({ where: { id: notificationId, userId: req.userId } });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    await notification.destroy();
    res.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Delete Notification Error:', error);
    res.status(500).json({ message: 'Internal server error deleting notification.' });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.destroy({ where: { userId: req.userId } });
    res.status(200).json({ message: 'All notifications deleted successfully.' });
  } catch (error) {
    console.error('Delete All Notifications Error:', error);
    res.status(500).json({ message: 'Internal server error deleting all notifications.' });
  }
};

