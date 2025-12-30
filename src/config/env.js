const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  APP_DB_HOST: Joi.string().required(),
  APP_DB_PORT: Joi.number().default(5432),
  APP_DB_NAME: Joi.string().required(),
  APP_DB_USER: Joi.string().required(),
  APP_DB_PASSWORD: Joi.string().required(),
  MAX_FILE_SIZE: Joi.number().default(52428800),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  LOG_LEVEL: Joi.string().default('info'),
  
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  appDb: {
    host: envVars.APP_DB_HOST,
    port: envVars.APP_DB_PORT,
    database: envVars.APP_DB_NAME,
    user: envVars.APP_DB_USER,
    password: envVars.APP_DB_PASSWORD,
  },
  maxFileSize: envVars.MAX_FILE_SIZE,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: envVars.RATE_LIMIT_MAX_REQUESTS
  },
  logLevel: envVars.LOG_LEVEL
};