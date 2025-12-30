const { createUserConnection } = require('../config/database');
const Connection = require('../models/Connection');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.applyFilters = asyncHandler(async (req, res) => {
  const { filters, tableIds } = req.body;

  if (!filters || Object.keys(filters).length === 0) {
    throw new AppError('No filters provided', 400);
  }

  // Get connection (assuming first connection for now)
  const connections = await Connection.findAll();
  if (connections.length === 0) {
    throw new AppError('No database connections available', 400);
  }

  const connection = connections[0];
  const pool = createUserConnection(connection);

  // Build WHERE clause
  const conditions = [];
  const values = [];
  let paramCount = 1;

  Object.entries(filters).forEach(([column, selectedValues]) => {
    if (selectedValues.includes(null)) {
      // Handle NULL values
      const nonNullValues = selectedValues.filter(v => v !== null);
      if (nonNullValues.length > 0) {
        const placeholders = nonNullValues.map(() => `${paramCount++}`).join(',');
        conditions.push(`(${column} IN (${placeholders}) OR ${column} IS NULL)`);
        values.push(...nonNullValues);
      } else {
        conditions.push(`${column} IS NULL`);
      }
    } else {
      const placeholders = selectedValues.map(() => `${paramCount++}`).join(',');
      conditions.push(`${column} IN (${placeholders})`);
      values.push(...selectedValues);
    }
  });

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get table name (simplified - get first table)
  const tableQuery = 'SELECT name FROM tables LIMIT 1';
  const tableResult = await pool.query(tableQuery);
  const tableName = tableResult.rows[0].name;

  // Query with filters
  const dataQuery = `SELECT * FROM ${tableName} ${whereClause} LIMIT 1000`;
  const dataResult = await pool.query(dataQuery, values);

  // Get count
  const countQuery = `SELECT COUNT(*) FROM ${tableName} ${whereClause}`;
  const countResult = await pool.query(countQuery, values);

  res.status(200).json({
    success: true,
    data: {
      rows: dataResult.rows,
      totalRows: parseInt(countResult.rows[0].count),
      appliedFilters: filters
    }
  });
});