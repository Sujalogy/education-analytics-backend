const { createUserConnection } = require('../config/database');
const Connection = require('../models/Connection');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class ConnectionService {
  async testConnection(connectionConfig) {
    try {
      const pool = createUserConnection(connectionConfig);
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      
      logger.info(`Connection test successful: ${connectionConfig.host}:${connectionConfig.database}`);
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      logger.error(`Connection test failed: ${error.message}`);
      throw new AppError(`Connection failed: ${error.message}`, 400);
    }
  }

  async createConnection(connectionData) {
    // Test connection first
    await this.testConnection(connectionData);
    
    // Save to database
    const connection = await Connection.create(connectionData);
    
    logger.info(`New connection created: ${connection.name}`);
    return connection;
  }

  async getAllConnections() {
    return await Connection.findAll();
  }

  async deleteConnection(id) {
    const connection = await Connection.findById(id);
    
    if (!connection) {
      throw new AppError('Connection not found', 404);
    }

    await Connection.delete(id);
    logger.info(`Connection deleted: ${id}`);
    
    return { success: true, message: 'Connection deleted' };
  }
}

module.exports = new ConnectionService();