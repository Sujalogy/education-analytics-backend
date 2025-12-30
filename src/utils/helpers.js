/**
 * Format bytes to human readable string
 */
exports.formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Generate random string
 */
exports.generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sanitize SQL identifier
 */
exports.sanitizeIdentifier = (identifier) => {
  return identifier.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
};

/**
 * Parse boolean from string
 */
exports.parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
};

/**
 * Chunk array into smaller arrays
 */
exports.chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Sleep/delay function
 */
exports.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Format date to SQL format
 */
exports.formatDateForSQL = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Deep clone object
 */
exports.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};