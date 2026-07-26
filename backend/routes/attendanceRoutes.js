const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Warden/Admin routes
router.get('/students', verifyToken, requireRole(['warden', 'admin']), attendanceController.getStudentsList);
router.post('/mark', verifyToken, requireRole(['warden', 'admin']), attendanceController.markBulkAttendance);
router.get('/summary', verifyToken, requireRole(['warden', 'admin']), attendanceController.getDailyAttendanceSummary);

// Student routes
router.get('/my-stats', verifyToken, requireRole(['student']), attendanceController.getStudentStats);

module.exports = router;
