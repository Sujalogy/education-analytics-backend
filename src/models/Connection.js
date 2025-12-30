const { appPool } = require('../config/database');

class Connection {
  static async create(connectionData) {
    const query = `
      INSERT INTO connections (name, host, port, database, username, password, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      connectionData.name,
      connectionData.host,
      connectionData.port,
      connectionData.database,
      connectionData.username,
      connectionData.password // In production, encrypt this!
    ];
    
    const result = await appPool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT id, name, host, port, database, username, created_at FROM connections ORDER BY created_at DESC';
    const result = await appPool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM connections WHERE id = $1';
    const result = await appPool.query(query, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM connections WHERE id = $1 RETURNING id';
    const result = await appPool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Connection;