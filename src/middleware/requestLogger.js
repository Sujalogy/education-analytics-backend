const morgan = require('morgan');
const logger = require('../utils/logger');

// Create a stream object for Morgan
const stream = {
  write: (message) => logger.http(message.trim())
};

// Morgan middleware with custom tokens
morgan.token('body', (req) => JSON.stringify(req.body));

const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms :body',
  { stream }
);

module.exports = requestLogger;