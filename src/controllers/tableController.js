const { appPool, createUserConnection } = require('../config/database');
const Connection = require('../models/Connection');
const Table = require('../models/Table');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.getAllTables = asyncHandler(async (req, res) => {
  const tables = await Table.findAll();
  
  res.status(200).json({
    success: true,
    count: tables.length,
    data: tables
  });
});

exports.getTablePreview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 100;
  
  const table = await Table.findById(id);
  if (!table) {
    throw new AppError('Table not found', 404);
  }

  const connection = await Connection.findById(table.connection_id);
  const pool = createUserConnection(connection);

  // Get columns
  const columnsQuery = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = $1
    ORDER BY ordinal_position
  `;
  const columnsResult = await pool.query(columnsQuery, [table.name]);
  
  // Get data preview
  const dataQuery = `SELECT * FROM ${table.name} LIMIT $1`;
  const dataResult = await pool.query(dataQuery, [limit]);

  // Get total count
  const countQuery = `SELECT COUNT(*) FROM ${table.name}`;
  const countResult = await pool.query(countQuery);

  res.status(200).json({
    success: true,
    data: {
      columns: columnsResult.rows,
      rows: dataResult.rows,
      totalRows: parseInt(countResult.rows[0].count)
    }
  });
});

exports.syncTables = asyncHandler(async (req, res) => {
  const connections = await Connection.findAll();
  let syncedCount = 0;

  for (const connection of connections) {
    const pool = createUserConnection(connection);
    
    // Get all tables from the database
    const query = `
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `;
    
    const result = await pool.query(query);
    
    for (const row of result.rows) {
      // Count rows in table
      const countQuery = `SELECT COUNT(*) FROM ${row.table_name}`;
      const countResult = await pool.query(countQuery);
      
      // Check if table already exists
      const existingTable = await appPool.query(
        'SELECT id FROM tables WHERE name = $1 AND connection_id = $2',
        [row.table_name, connection.id]
      );

      if (existingTable.rows.length === 0) {
        await Table.create({
          name: row.table_name,
          connectionId: connection.id,
          sourceType: 'postgresql',
          rowCount: parseInt(countResult.rows[0].count),
          columnCount: row.column_count
        });
        syncedCount++;
      } else {
        await Table.updateRowCount(
          existingTable.rows[0].id,
          parseInt(countResult.rows[0].count)
        );
      }
    }
  }

  res.status(200).json({
    success: true,
    message: `Synced ${syncedCount} tables`,
    count: syncedCount
  });
});