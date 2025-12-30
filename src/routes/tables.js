const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

router.get('/', tableController.getAllTables);
router.get('/:id/preview', tableController.getTablePreview);
router.post('/sync', tableController.syncTables);

module.exports = router;