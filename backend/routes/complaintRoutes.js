const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const complaintController = require('../controllers/complaintController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/raise', verifyToken, requireRole(['student']), upload.single('photo'), complaintController.raiseComplaint);
router.get('/student', verifyToken, requireRole(['student']), complaintController.getStudentComplaints);
router.get('/warden', verifyToken, requireRole(['warden', 'admin']), complaintController.getWardenComplaints);
router.get('/staff', verifyToken, requireRole(['staff', 'admin']), complaintController.getStaffComplaints);
router.put('/assign/:complaintId', verifyToken, requireRole(['warden', 'admin']), complaintController.assignComplaint);
router.put('/update-status/:complaintId', verifyToken, requireRole(['staff', 'warden', 'admin']), upload.single('completionPhoto'), complaintController.updateStatus);
router.put('/feedback/:complaintId', verifyToken, requireRole(['student']), complaintController.addFeedback);
router.get('/details/:complaintId', verifyToken, complaintController.getComplaintDetails);
router.get('/analytics', verifyToken, requireRole(['admin', 'warden']), complaintController.getAnalytics);
router.get('/staff-workload', verifyToken, requireRole(['warden', 'admin']), complaintController.getStaffWorkload);
router.delete('/delete/:complaintId', verifyToken, requireRole(['warden', 'admin']), complaintController.deleteComplaint);

module.exports = router;
