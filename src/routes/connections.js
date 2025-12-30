const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const validate = require('../middleware/validator');
const { connectionSchema } = require('../utils/validators');

router
  .route('/')
  .get(connectionController.getAllConnections)
  .post(validate(connectionSchema), connectionController.createConnection);

router
  .route('/:id')
  .delete(connectionController.deleteConnection);

router
  .route('/:id/test')
  .post(connectionController.testConnection);

module.exports = router;