const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/auth');

const managementController = require('../controllers/managementController');

router.get('/staff', verifyToken, requireRole(['warden', 'admin']), userController.getStaffList);
router.get('/all', verifyToken, requireRole(['admin']), userController.getAllUsers);
router.put('/status/:userId', verifyToken, requireRole(['admin']), userController.updateUserStatus);
router.put('/edit/:userId', verifyToken, requireRole(['admin']), userController.updateUserDetails);
router.post('/create-staff-warden', verifyToken, requireRole(['admin']), userController.createWardenOrStaff);
router.get('/wardens', verifyToken, userController.getWardenList);
router.delete('/delete/:userId', verifyToken, requireRole(['admin']), userController.deleteUser);

// Executive Management & Admin endpoints mounted under /api/users
router.get('/analytics', verifyToken, managementController.getManagementAnalytics);
router.post('/bulk-import', verifyToken, requireRole(['admin']), managementController.bulkCreateBatchFromExcel);
router.post('/terminate-user', verifyToken, requireRole(['admin']), managementController.terminateUser);
router.post('/terminate-batch', verifyToken, requireRole(['admin']), managementController.terminateBatch);
router.get('/staff-performance', verifyToken, userController.getStaffPerformance);
router.get('/attendance-stats', verifyToken, userController.getAttendanceStats);

// Warden Student Approvals
router.get('/debug-db', userController.debugDB);
router.get('/pending', verifyToken, requireRole(['warden', 'admin']), userController.getPendingApprovals);
router.put('/approve/:userId', verifyToken, requireRole(['warden', 'admin']), userController.approveUser);
router.delete('/reject/:userId', verifyToken, requireRole(['warden', 'admin']), userController.rejectUser);

module.exports = router;
