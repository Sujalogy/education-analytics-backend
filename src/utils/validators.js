const Joi = require('joi');

const connectionSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  host: Joi.string().required(),
  port: Joi.number().integer().min(1).max(65535).required(),
  database: Joi.string().required().min(1),
  username: Joi.string().required().min(1),
  password: Joi.string().required().min(1)
});

const filterSchema = Joi.object({
  filters: Joi.object().pattern(
    Joi.string(),
    Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.allow(null)))
  ).required(),
  tableIds: Joi.array().items(Joi.number()).optional()
});

const pivotSchema = Joi.object({
  rows: Joi.array().items(Joi.string()).required(),
  columns: Joi.array().items(Joi.string()).optional(),
  values: Joi.array().items(Joi.object({
    column: Joi.string().required(),
    aggregation: Joi.string().valid('SUM', 'COUNT', 'AVG', 'MEDIAN', 'MODE', 'MIN', 'MAX', 'STDDEV').required()
  })).required(),
  filters: Joi.object().optional()
});

const statisticsSchema = Joi.object({
  column: Joi.string().required(),
  filters: Joi.object().optional()
});

const columnMergeSchema = Joi.object({
  sourceColumns: Joi.array().items(Joi.number()).min(2).required(),
  mergedName: Joi.string().required().min(1).max(100),
  strategy: Joi.string().valid('FIRST_NON_NULL', 'LATEST_DATE', 'CUSTOM').required()
});

module.exports = {
  connectionSchema,
  filterSchema,
  pivotSchema,
  statisticsSchema,
  columnMergeSchema
};