const { appPool } = require('../config/database');

class Table {
  static async create(tableData) {
    const query = `
      INSERT INTO tables (name, connection_id, source_type, row_count, column_count, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    
    const values = [
      tableData.name,
      tableData.connectionId,
      tableData.sourceType,
      tableData.rowCount,
      tableData.columnCount
    ];
    
    const result = await appPool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT t.*, c.name as connection_name
      FROM tables t
      LEFT JOIN connections c ON t.connection_id = c.id
      ORDER BY t.created_at DESC
    `;
    const result = await appPool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM tables WHERE id = $1';
    const result = await appPool.query(query, [id]);
    return result.rows[0];
  }

  static async updateRowCount(id, rowCount) {
    const query = 'UPDATE tables SET row_count = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
    const result = await appPool.query(query, [rowCount, id]);
    return result.rows[0];
  }
}

module.exports = Table;