const express = require('express');
const router = express.Router();
const columnController = require('../controllers/columnController');
const validate = require('../middleware/validator');
const { columnMergeSchema } = require('../utils/validators');

router.get('/', columnController.getAllColumns);
router.get('/:id/distinct-values', columnController.getDistinctValues);
router.get('/detect-similar', columnController.detectSimilar);
router.post('/merge', validate(columnMergeSchema), columnController.mergeColumns);

module.exports = router;