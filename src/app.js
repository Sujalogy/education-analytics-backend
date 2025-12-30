const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
require('express-async-errors');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api', rateLimiter);

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;