const connectionService = require('../services/connectionService');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllConnections = asyncHandler(async (req, res) => {
  const connections = await connectionService.getAllConnections();
  
  res.status(200).json({
    success: true,
    count: connections.length,
    data: connections
  });
});

exports.createConnection = asyncHandler(async (req, res) => {
  const connection = await connectionService.createConnection(req.body);
  
  res.status(201).json({
    success: true,
    data: connection
  });
});

exports.testConnection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const Connection = require('../models/Connection');
  
  const connection = await Connection.findById(id);
  if (!connection) {
    return res.status(404).json({
      success: false,
      error: 'Connection not found'
    });
  }

  const result = await connectionService.testConnection(connection);
  
  res.status(200).json({
    success: true,
    data: result
  });
});

exports.deleteConnection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await connectionService.deleteConnection(id);
  
  res.status(200).json({
    success: true,
    message: 'Connection deleted successfully'
  });
});