const { createUserConnection } = require('../config/database');
const Connection = require('../models/Connection');
const AppError = require('../utils/AppError');

class PivotService {
  async executePivot(pivotConfig) {
    const { rows, columns, values, filters } = pivotConfig;

    try {
      // Build pivot query
      const query = this.buildPivotQuery(rows, columns, values, filters);
      
      // Execute query
      const connection = await this.getConnection();
      const pool = createUserConnection(connection);
      const result = await pool.query(query);

      return {
        data: result.rows,
        config: pivotConfig,
        rowCount: result.rowCount
      };
    } catch (error) {
      throw new AppError(`Pivot execution failed: ${error.message}`, 500);
    }
  }

  buildPivotQuery(rows, columns, values, filters) {
    // Build SELECT clause with aggregations
    const selectFields = [
      ...rows.map(r => `${r}`),
      ...values.map(v => `${v.aggregation}(${v.column}) as ${v.column}_${v.aggregation.toLowerCase()}`)
    ];

    // Build GROUP BY clause
    const groupBy = rows.join(', ');

    // Build WHERE clause from filters
    const whereClause = this.buildWhereClause(filters);

    // Build ORDER BY clause
    const orderBy = rows.join(', ');

    let query = `
      SELECT ${selectFields.join(', ')}
      FROM (
        SELECT * FROM tables
        ${whereClause}
      ) as filtered_data
      GROUP BY ${groupBy}
      ORDER BY ${orderBy}
    `;

    // If columns specified, add CASE statements for pivot
    if (columns && columns.length > 0) {
      // This creates a crosstab-style pivot
      query = this.buildCrosstabQuery(rows, columns, values, filters);
    }

    return query;
  }

  buildCrosstabQuery(rows, columns, values, filters) {
    // PostgreSQL crosstab implementation
    // Requires tablefunc extension
    const whereClause = this.buildWhereClause(filters);
    
    return `
      SELECT * FROM crosstab(
        'SELECT ${rows.join(', ')}, ${columns[0]}, ${values[0].aggregation}(${values[0].column})
         FROM tables
         ${whereClause}
         GROUP BY ${rows.join(', ')}, ${columns[0]}
         ORDER BY ${rows.join(', ')}, ${columns[0]}',
        'SELECT DISTINCT ${columns[0]} FROM tables ORDER BY ${columns[0]}'
      ) AS ct(${rows.join(' text, ')}, ${columns[0]}_values numeric)
    `;
  }

  buildWhereClause(filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return '';
    }

    const conditions = Object.entries(filters).map(([column, values]) => {
      if (values.includes(null)) {
        const nonNullValues = values.filter(v => v !== null);
        if (nonNullValues.length > 0) {
          return `(${column} IN (${nonNullValues.map(v => `'${v}'`).join(',')}) OR ${column} IS NULL)`;
        }
        return `${column} IS NULL`;
      }
      return `${column} IN (${values.map(v => `'${v}'`).join(',')})`;
    });

    return `WHERE ${conditions.join(' AND ')}`;
  }

  async getConnection() {
    // Get first available connection (or implement connection selection logic)
    const connections = await Connection.findAll();
    if (connections.length === 0) {
      throw new AppError('No database connections available', 400);
    }
    return connections[0];
  }
}

module.exports = new PivotService();