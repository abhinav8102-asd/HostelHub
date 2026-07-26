const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

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
    cb(null, `chat-${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.get('/groups', verifyToken, chatController.getMyGroups);
router.get('/messages/:groupId', verifyToken, chatController.getGroupMessages);
router.post('/send', verifyToken, chatController.sendMessage);
router.post('/upload', verifyToken, upload.single('image'), chatController.uploadChatImage);
router.delete('/messages/:messageId/everyone', verifyToken, chatController.deleteMessageForEveryone);
router.post('/messages/bulk-delete-everyone', verifyToken, chatController.bulkDeleteMessagesForEveryone);

module.exports = router;
