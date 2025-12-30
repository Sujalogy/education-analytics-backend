const exportService = require('../services/exportService');
const pivotService = require('../services/pivotService');
const statisticsService = require('../services/statisticsService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Handles exporting Pivot Table data
 * URL: POST /api/export/pivot
 */
exports.handlePivotExport = asyncHandler(async (req, res) => {
  const { rows, columns, values, filters, format } = req.body;

  // 1. Fetch fresh data from the database using the pivot logic
  const pivotResult = await pivotService.executePivot({ rows, columns, values, filters });
  const data = pivotResult.data;

  let buffer;
  let contentType;
  let fileName = `pivot_export_${Date.now()}`;

  // 2. Select format logic
  switch (format) {
    case 'excel':
      buffer = await exportService.exportToExcel(data, { title: 'Pivot Analysis', filters });
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileName += '.xlsx';
      break;
    case 'csv':
      buffer = await exportService.exportToCSV(data);
      contentType = 'text/csv';
      fileName += '.csv';
      break;
    case 'pdf':
      buffer = await exportService.exportToPDF(data, null, null, 'Pivot Table Report');
      contentType = 'application/pdf';
      fileName += '.pdf';
      break;
    default:
      return res.status(400).json({ success: false, message: 'Unsupported format' });
  }

  // 3. Send binary data to frontend
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(buffer);
});

/**
 * Handles exporting Statistical Analysis
 * URL: POST /api/export/statistics
 */
exports.handleStatisticsExport = asyncHandler(async (req, res) => {
  const { tableId, columnId, format } = req.body;

  // 1. Fetch fresh statistics
  const stats = await statisticsService.calculateStatistics(tableId, columnId);
  
  // Format stats object into an array for the table display in Excel/PDF
  const flatData = Object.entries(stats)
    .filter(([key]) => typeof stats[key] !== 'object') // Basic metrics
    .map(([metric, value]) => ({ Metric: metric, Value: value }));

  let buffer;
  let contentType;
  let fileName = `stats_report_${Date.now()}`;

  if (format === 'excel') {
    buffer = await exportService.exportToExcel(flatData, { title: 'Descriptive Statistics', statistics: stats });
    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    fileName += '.xlsx';
  } else if (format === 'csv') {
    buffer = await exportService.exportToCSV(flatData);
    contentType = 'text/csv';
    fileName += '.csv';
  } else {
    buffer = await exportService.exportToPDF(flatData, stats, null, 'Statistical Analysis Report');
    contentType = 'application/pdf';
    fileName += '.pdf';
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(buffer);
});