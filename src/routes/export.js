const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

router.post('/excel', exportController.exportToExcel);
router.post('/csv', exportController.exportToCSV);
router.post('/pdf', exportController.exportToPDF);

module.exports = router;