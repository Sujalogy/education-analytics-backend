const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const validate = require('../middleware/validator');
const { statisticsSchema } = require('../utils/validators');

router.post('/calculate', validate(statisticsSchema), statisticsController.calculateStatistics);

module.exports = router;