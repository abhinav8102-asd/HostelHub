const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/staff', verifyToken, requireRole(['warden', 'admin']), userController.getStaffList);
router.get('/all', verifyToken, requireRole(['admin']), userController.getAllUsers);
router.put('/status/:userId', verifyToken, requireRole(['admin']), userController.updateUserStatus);
router.post('/create-staff-warden', verifyToken, requireRole(['admin']), userController.createWardenOrStaff);
router.get('/wardens', verifyToken, userController.getWardenList);
router.delete('/delete/:userId', verifyToken, requireRole(['admin']), userController.deleteUser);

// Warden Student Approvals
router.get('/pending', verifyToken, requireRole(['warden', 'admin']), userController.getPendingApprovals);
router.put('/approve/:userId', verifyToken, requireRole(['warden', 'admin']), userController.approveUser);
router.delete('/reject/:userId', verifyToken, requireRole(['warden', 'admin']), userController.rejectUser);

module.exports = router;
