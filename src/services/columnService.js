const { appPool, createUserConnection } = require('../config/database');
const Connection = require('../models/Connection');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class ColumnService {
  async getAllColumns() {
    const query = `
      SELECT c.*, t.name as table_name, t.source_type
      FROM columns c
      JOIN tables t ON c.table_id = t.id
      ORDER BY t.name, c.name
    `;
    const result = await appPool.query(query);
    return result.rows;
  }

  async getDistinctValues(columnId) {
    try {
      // Get column info
      const columnQuery = `
        SELECT c.*, t.name as table_name, t.connection_id
        FROM columns c
        JOIN tables t ON c.table_id = t.id
        WHERE c.id = $1
      `;
      const columnResult = await appPool.query(columnQuery, [columnId]);
      
      if (columnResult.rows.length === 0) {
        throw new AppError('Column not found', 404);
      }

      const column = columnResult.rows[0];
      
      // Get connection details
      const connection = await Connection.findById(column.connection_id);
      const pool = createUserConnection(connection);

      // Query distinct values INCLUDING NULL
      const query = `
        SELECT 
          ${column.name} as value,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM ${column.table_name}
        GROUP BY ${column.name}
        ORDER BY count DESC
      `;

      const result = await pool.query(query);
      
      logger.info(`Retrieved ${result.rows.length} distinct values for column ${column.name}`);
      return result.rows;
    } catch (error) {
      logger.error(`Error getting distinct values: ${error.message}`);
      throw new AppError(`Failed to get distinct values: ${error.message}`, 500);
    }
  }

  async detectSimilarColumns() {
    const query = `
      SELECT 
        c1.id as id1,
        c1.name as name1,
        c1.table_id as table_id1,
        c2.id as id2,
        c2.name as name2,
        c2.table_id as table_id2,
        similarity(c1.name, c2.name) as similarity
      FROM columns c1
      JOIN columns c2 ON c1.id < c2.id
      WHERE similarity(c1.name, c2.name) > 0.6
      ORDER BY similarity DESC
    `;

    const result = await appPool.query(query);
    
    // Group similar columns
    const groups = new Map();
    
    result.rows.forEach(row => {
      const key = `${row.name1}_${row.name2}`;
      if (!groups.has(key)) {
        groups.set(key, {
          columns: [
            { id: row.id1, name: row.name1, tableId: row.table_id1 },
            { id: row.id2, name: row.name2, tableId: row.table_id2 }
          ],
          similarity: row.similarity
        });
      }
    });

    return Array.from(groups.values());
  }

  async mergeColumns(mergeData) {
    // Implementation for virtual column merge
    // Store merge configuration in database
    const query = `
      INSERT INTO merged_columns (name, source_column_ids, strategy, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;

    const values = [
      mergeData.mergedName,
      mergeData.sourceColumns,
      mergeData.strategy
    ];

    const result = await appPool.query(query, values);
    logger.info(`Columns merged: ${mergeData.mergedName}`);
    
    return result.rows[0];
  }
}

module.exports = new ColumnService();