const columnService = require('../services/columnService');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllColumns = asyncHandler(async (req, res) => {
  const columns = await columnService.getAllColumns();
  
  res.status(200).json({
    success: true,
    count: columns.length,
    data: columns
  });
});

exports.getDistinctValues = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const values = await columnService.getDistinctValues(id);
  
  res.status(200).json({
    success: true,
    count: values.length,
    data: values
  });
});

exports.detectSimilar = asyncHandler(async (req, res) => {
  const similarGroups = await columnService.detectSimilarColumns();
  
  res.status(200).json({
    success: true,
    count: similarGroups.length,
    data: similarGroups
  });
});

exports.mergeColumns = asyncHandler(async (req, res) => {
  const result = await columnService.mergeColumns(req.body);
  
  res.status(201).json({
    success: true,
    data: result
  });
});