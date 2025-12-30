const app = require('./src/app');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');
const { appPool } = require('./src/config/database');

const PORT = config.port;
// Test database connection
appPool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Database connection failed:', err);
    process.exit(1);
  }
  logger.info('Database connected successfully');
});

const server = app.listen(PORT, () => {
  console.log("ceck")
  logger.info(`Server running in ${config.env} mode on port ${PORT}`);
  logger.info(`API available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

appPool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("❌ DATABASE CONNECTION ERROR:", err.message);
  } else {
    console.log("✅ Database Connected at:", res.rows[0].now);
  }
});

module.exports = server;