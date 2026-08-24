const express = require('express');
const router = express.Router();
const messReviewController = require('../controllers/messReviewController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/submit', verifyToken, requireRole(['student']), messReviewController.submitMessReview);
router.get('/analytics', verifyToken, messReviewController.getMessAnalytics);

module.exports = router;
