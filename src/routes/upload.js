const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.post('/excel', uploadController.uploadMiddleware, uploadController.uploadExcel);

module.exports = router;