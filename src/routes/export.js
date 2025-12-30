const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// Match frontend calls
router.post('/pivot', exportController.handlePivotExport);
router.post('/statistics', exportController.handleStatisticsExport);

module.exports = router;