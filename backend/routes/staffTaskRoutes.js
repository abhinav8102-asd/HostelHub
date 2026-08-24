const express = require('express');
const router = express.Router();
const staffTaskController = require('../controllers/staffTaskController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/create', verifyToken, requireRole(['admin']), staffTaskController.createStaffTask);
router.get('/all', verifyToken, staffTaskController.getStaffTasks);
router.put('/status/:id', verifyToken, staffTaskController.updateTaskStatus);

module.exports = router;
