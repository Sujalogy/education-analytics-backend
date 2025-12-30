const pivotService = require('../services/pivotService');
const asyncHandler = require('../utils/asyncHandler');

exports.executePivot = asyncHandler(async (req, res) => {
  const result = await pivotService.executePivot(req.body);
  
  res.status(200).json({
    success: true,
    data: result
  });
});