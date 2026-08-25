const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const settingController = require('../controllers/settingController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config for settings files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Get footer settings (authenticated users)
router.get('/footer', verifyToken, settingController.getFooterSettings);

// Update footer settings (admin only)
router.put('/footer', verifyToken, requireRole(['admin']), settingController.updateFooterSettings);

// Get public settings (authenticated users)
router.get('/public', verifyToken, settingController.getPublicSettings);

// Update public settings (admin only)
router.put('/public', verifyToken, requireRole(['admin']), settingController.updatePublicSettings);

// Upload developer profile picture (admin only)
router.post('/upload-dev-pic', verifyToken, requireRole(['admin']), upload.single('pic'), settingController.uploadDevPic);

module.exports = router;

