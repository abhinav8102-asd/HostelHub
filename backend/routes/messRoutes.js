const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');
const { verifyToken, requireRole } = require('../middleware/auth');

const path = require('path');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Menu routes
router.get('/menu', verifyToken, messController.getMenu);
router.put('/menu/:id', verifyToken, requireRole(['warden', 'admin']), messController.updateMenu);

// Feedback routes
router.post('/feedback', verifyToken, requireRole(['student']), upload.single('photo'), messController.submitFeedback);
router.get('/feedback/stats', verifyToken, requireRole(['warden', 'admin']), messController.getFeedbackStats);

// Skip meal routes
router.post('/skip', verifyToken, requireRole(['student']), messController.toggleSkipMeal);
router.get('/skip/my', verifyToken, requireRole(['student']), messController.getMySkippedMeals);
router.get('/skip/summary', verifyToken, requireRole(['warden', 'admin']), messController.getSkipSummary);

module.exports = router;
