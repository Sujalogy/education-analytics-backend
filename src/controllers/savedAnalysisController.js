const { appPool } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.getAllSavedAnalyses = asyncHandler(async (req, res) => {
  const query = 'SELECT * FROM saved_analyses ORDER BY created_at DESC';
  const result = await appPool.query(query);
  
  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

exports.createSavedAnalysis = asyncHandler(async (req, res) => {
  const { name, description, config } = req.body;
  
  const query = `
    INSERT INTO saved_analyses (name, description, config, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING *
  `;
  
  const result = await appPool.query(query, [name, description, JSON.stringify(config)]);
  
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});

exports.getSavedAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const query = 'SELECT * FROM saved_analyses WHERE id = $1';
  const result = await appPool.query(query, [id]);
  
  if (result.rows.length === 0) {
    throw new AppError('Saved analysis not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});

exports.deleteSavedAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM saved_analyses WHERE id = $1 RETURNING id';
  const result = await appPool.query(query, [id]);
  
  if (result.rows.length === 0) {
    throw new AppError('Saved analysis not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Saved analysis deleted successfully'
  });
});