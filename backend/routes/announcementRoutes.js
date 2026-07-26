const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const announcementController = require('../controllers/announcementController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `notice-${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/create', verifyToken, requireRole(['warden', 'admin']), upload.single('photo'), announcementController.createAnnouncement);
router.get('/list', verifyToken, announcementController.getAnnouncements);
router.delete('/delete/:announcementId', verifyToken, requireRole(['warden', 'admin']), announcementController.deleteAnnouncement);

module.exports = router;

