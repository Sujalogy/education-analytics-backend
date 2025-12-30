const express = require('express');
const router = express.Router();
const pivotController = require('../controllers/pivotController');
const validate = require('../middleware/validator');
const { pivotSchema } = require('../utils/validators');

router.post('/execute', validate(pivotSchema), pivotController.executePivot);

module.exports = router;