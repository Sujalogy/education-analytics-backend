const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filterController');
const validate = require('../middleware/validator');
const { filterSchema } = require('../utils/validators');

router.post('/apply', validate(filterSchema), filterController.applyFilters);

module.exports = router;