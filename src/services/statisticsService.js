const { createUserConnection } = require('../config/database');
const Connection = require('../models/Connection');
const AppError = require('../utils/AppError');

class StatisticsService {
  async calculateStatistics(data) {
    const { column, filters } = data;

    try {
      // Get column and table info
      const columnInfo = await this.getColumnInfo(column);
      const connection = await Connection.findById(columnInfo.connection_id);
      const pool = createUserConnection(connection);

      // Build WHERE clause from filters
      const whereClause = this.buildWhereClause(filters);

      // Calculate all statistics in one query
      const query = `
        WITH stats AS (
          SELECT 
            COUNT(${column}) as count,
            AVG(${column}) as mean,
            STDDEV_POP(${column}) as stddev,
            VARIANCE(${column}) as variance,
            MIN(${column}) as min,
            MAX(${column}) as max,
            PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY ${column}) as q1,
            PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY ${column}) as median,
            PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ${column}) as q3,
            PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY ${column}) as p90,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ${column}) as p95,
            MODE() WITHIN GROUP (ORDER BY ${column}) as mode
          FROM ${columnInfo.table_name}
          ${whereClause}
        )
        SELECT 
          *,
          (max - min) as range,
          (q3 - q1) as iqr,
          (stddev / SQRT(count)) as standard_error
        FROM stats
      `;

      const result = await pool.query(query);
      const stats = result.rows[0];

      // Calculate confidence interval (95%)
      const criticalValue = 1.96; // For 95% confidence
      const marginOfError = criticalValue * stats.standard_error;
      
      return {
        count: parseInt(stats.count),
        mean: parseFloat(stats.mean),
        median: parseFloat(stats.median),
        mode: parseFloat(stats.mode),
        stdDev: parseFloat(stats.stddev),
        variance: parseFloat(stats.variance),
        min: parseFloat(stats.min),
        max: parseFloat(stats.max),
        range: parseFloat(stats.range),
        iqr: parseFloat(stats.iqr),
        percentiles: {
          q1: parseFloat(stats.q1),
          q2: parseFloat(stats.median),
          q3: parseFloat(stats.q3),
          p90: parseFloat(stats.p90),
          p95: parseFloat(stats.p95)
        },
        confidenceInterval: {
          lower: parseFloat(stats.mean) - marginOfError,
          upper: parseFloat(stats.mean) + marginOfError,
          level: 0.95
        },
        standardError: parseFloat(stats.standard_error)
      };
    } catch (error) {
      throw new AppError(`Statistics calculation failed: ${error.message}`, 500);
    }
  }

  buildWhereClause(filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return '';
    }

    const conditions = Object.entries(filters).map(([column, values]) => {
      if (values.includes(null)) {
        // Handle NULL values
        const nonNullValues = values.filter(v => v !== null);
        if (nonNullValues.length > 0) {
          return `(${column} IN (${nonNullValues.map(v => `'${v}'`).join(',')}) OR ${column} IS NULL)`;
        } else {
          return `${column} IS NULL`;
        }
      }
      return `${column} IN (${values.map(v => `'${v}'`).join(',')})`;
    });

    return `WHERE ${conditions.join(' AND ')}`;
  }

  async getColumnInfo(columnName) {
    const query = `
      SELECT c.*, t.name as table_name, t.connection_id
      FROM columns c
      JOIN tables t ON c.table_id = t.id
      WHERE c.name = $1
      LIMIT 1
    `;
    const result = await appPool.query(query, [columnName]);
    if (result.rows.length === 0) {
      throw new AppError('Column not found', 404);
    }
    return result.rows[0];
  }
}

module.exports = new StatisticsService();