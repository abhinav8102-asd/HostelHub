const express = require('express');
const router = express.Router();
const managementController = require('../controllers/managementController');
const { verifyToken, isAdmin, isManagement } = require('../middleware/auth');

// Admin routes for Management accounts
router.post('/accounts', verifyToken, isAdmin, managementController.createManagementAccount);
router.get('/accounts', verifyToken, managementController.getManagementAccounts);
router.delete('/accounts/:id', verifyToken, isAdmin, managementController.deleteManagementAccount);

// Executive Management & Admin routes
router.get('/analytics', verifyToken, managementController.getManagementAnalytics);
router.post('/bulk-import', verifyToken, managementController.bulkCreateBatchFromExcel);
router.post('/terminate-user', verifyToken, managementController.terminateUser);
router.post('/terminate-batch', verifyToken, managementController.terminateBatch);

module.exports = router;
