const exportService = require('../services/exportService');
const asyncHandler = require('../utils/asyncHandler');

exports.exportToExcel = asyncHandler(async (req, res) => {
  const { data, config } = req.body;
  
  const buffer = await exportService.exportToExcel(data, config);
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=export.xlsx');
  res.send(buffer);
});

exports.exportToCSV = asyncHandler(async (req, res) => {
  const { data } = req.body;
  
  const buffer = await exportService.exportToCSV(data);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
  res.send(buffer);
});

exports.exportToPDF = asyncHandler(async (req, res) => {
  const { data, stats, chartImage } = req.body;
  
  const buffer = await exportService.exportToPDF(data, stats, chartImage);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=export.pdf');
  res.send(Buffer.from(buffer));
});