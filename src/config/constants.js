module.exports = {
  // Aggregation functions
  AGGREGATIONS: {
    SUM: 'SUM',
    COUNT: 'COUNT',
    AVG: 'AVG',
    MEDIAN: 'MEDIAN',
    MODE: 'MODE',
    MIN: 'MIN',
    MAX: 'MAX',
    STDDEV: 'STDDEV'
  },

  // Data types
  DATA_TYPES: {
    TEXT: 'text',
    NUMERIC: 'numeric',
    DATE: 'date',
    BOOLEAN: 'boolean',
    JSON: 'json'
  },

  // Source types
  SOURCE_TYPES: {
    POSTGRESQL: 'postgresql',
    EXCEL: 'excel'
  },

  // Merge strategies
  MERGE_STRATEGIES: {
    FIRST_NON_NULL: 'FIRST_NON_NULL',
    LATEST_DATE: 'LATEST_DATE',
    CUSTOM: 'CUSTOM'
  },

  // Export formats
  EXPORT_FORMATS: {
    EXCEL: 'excel',
    CSV: 'csv',
    PDF: 'pdf'
  },

  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 100,
  MAX_PAGE_SIZE: 1000,

  // File upload
  MAX_FILE_SIZE: 52428800, // 50MB
  ALLOWED_EXTENSIONS: ['.xlsx', '.xls'],

  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100
};