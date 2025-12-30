const express = require('express');
const router = express.Router();

const connectionRoutes = require('./connections');
const tableRoutes = require('./tables');
const columnRoutes = require('./columns');
const filterRoutes = require('./filters');
const pivotRoutes = require('./pivot');
const statisticsRoutes = require('./statistics');
const exportRoutes = require('./export');
const uploadRoutes = require('./upload');
const savedAnalysesRoutes = require('./savedAnalyses');

router.use('/connections', connectionRoutes);
router.use('/tables', tableRoutes);
router.use('/columns', columnRoutes);
router.use('/filters', filterRoutes);
router.use('/pivot', pivotRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/export', exportRoutes);
router.use('/upload', uploadRoutes);
router.use('/saved-analyses', savedAnalysesRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;