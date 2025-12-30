const { Pool } = require("pg");
const config = require("./env");
const logger = require("../utils/logger");


const appPool = new Pool({
  host: config.appDb.host,
  port: config.appDb.port,
  database: config.appDb.database,
  user: config.appDb.user,
  password: config.appDb.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: config.appDb.ssl || false, // ✅ safer than empty object
  allowExitOnIdle: false,
});

// Log only once
let appDbConnected = false;

appPool.on("connect", () => {
  if (!appDbConnected) {
    logger.info("Connected to application database");
    appDbConnected = true;
  }
});

appPool.on("error", (err) => {
  logger.error("Unexpected error on application DB idle client", err);
  process.exit(1);
});

/* ================================
   User Database Connection Pools
   ================================ */

const userConnections = new Map();

/**
 * Create or reuse a user DB pool
 */
const createUserConnection = (connectionConfig) => {
  const key = `${connectionConfig.host}:${connectionConfig.port}:${connectionConfig.database}`;

  if (userConnections.has(key)) {
    return userConnections.get(key);
  }

  const pool = new Pool({
    host: connectionConfig.host,
    port: connectionConfig.port,
    database: connectionConfig.database,
    user: connectionConfig.user || connectionConfig.username, // ✅ flexible
    password: connectionConfig.password,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: connectionConfig.ssl || false,
    allowExitOnIdle: false,
  });

  pool.on("connect", () => {
    logger.info(`Connected to user database: ${key}`);
  });

  pool.on("error", (err) => {
    logger.error(`User connection pool error for ${key}`, err);
    userConnections.delete(key);
  });

  userConnections.set(key, pool);
  return pool;
};

/**
 * Close user DB pool safely
 */
const closeUserConnection = async (connectionConfig) => {
  const key = `${connectionConfig.host}:${connectionConfig.port}:${connectionConfig.database}`;
  const pool = userConnections.get(key);

  if (!pool) return;

  try {
    await pool.end();
    logger.info(`Closed user connection: ${key}`);
  } catch (err) {
    logger.error(`Error closing user connection ${key}`, err);
  } finally {
    userConnections.delete(key);
  }
};

module.exports = {
  appPool,
  createUserConnection,
  closeUserConnection,
  userConnections,
};
