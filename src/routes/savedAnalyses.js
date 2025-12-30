const express = require('express');
const router = express.Router();
const savedAnalysisController = require('../controllers/savedAnalysisController');

router.get('/', savedAnalysisController.getAllSavedAnalyses);
router.post('/', savedAnalysisController.createSavedAnalysis);
router.get('/:id', savedAnalysisController.getSavedAnalysis);
router.delete('/:id', savedAnalysisController.deleteSavedAnalysis);

module.exports = router;