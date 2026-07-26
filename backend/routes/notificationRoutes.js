const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, notificationController.getNotifications);
router.put('/read', verifyToken, notificationController.markAllAsRead);
router.delete('/delete-all', verifyToken, notificationController.deleteAllNotifications);
router.delete('/delete/:notificationId', verifyToken, notificationController.deleteNotification);

module.exports = router;
