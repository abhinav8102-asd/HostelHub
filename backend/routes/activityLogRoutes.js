const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { verifyToken } = require('../middleware/auth');

router.get('/feed', verifyToken, activityLogController.getActivityLogs);

module.exports = router;
