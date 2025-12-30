const statisticsService = require('../services/statisticsService');
const asyncHandler = require('../utils/asyncHandler');

exports.calculateStatistics = asyncHandler(async (req, res) => {
  const statistics = await statisticsService.calculateStatistics(req.body);
  
  res.status(200).json({
    success: true,
    data: statistics
  });
});