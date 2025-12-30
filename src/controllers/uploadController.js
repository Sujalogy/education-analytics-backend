const multer = require('multer');
const path = require('path');
const ExcelJS = require('exceljs');
const { appPool } = require('../config/database');
const Table = require('../models/Table');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const fs = require('fs').promises;

// Configure multer
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 52428800 }, // 50MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new AppError('Only Excel files are allowed', 400));
    }
    cb(null, true);
  }
}).single('file');

exports.uploadMiddleware = upload;

exports.uploadExcel = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const filePath = req.file.path;
  const workbook = new ExcelJS.Workbook();
  
  try {
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    
    // Get headers from first row
    const headers = [];
    worksheet.getRow(1).eachCell((cell) => {
      headers.push(cell.value.toString().toLowerCase().replace(/\s+/g, '_'));
    });

    // Create table in database
    const tableName = `excel_${Date.now()}`;
    
    // Build CREATE TABLE query
    const columnDefinitions = headers.map(h => `${h} TEXT`).join(', ');
    const createTableQuery = `
      CREATE TABLE ${tableName} (
        id SERIAL PRIMARY KEY,
        ${columnDefinitions}
      )
    `;
    
    await appPool.query(createTableQuery);

    // Insert data
    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const values = [];
        row.eachCell({ includeEmpty: true }, (cell) => {
          values.push(cell.value);
        });
        rows.push(values);
      }
    });

    // Bulk insert
    if (rows.length > 0) {
      const placeholders = rows.map((_, i) => {
        const rowPlaceholders = headers.map((_, j) => `${i * headers.length + j + 1}`).join(', ');
        return `(${rowPlaceholders})`;
      }).join(', ');

      const insertQuery = `
        INSERT INTO ${tableName} (${headers.join(', ')})
        VALUES ${placeholders}
      `;

      const flatValues = rows.flat();
      await appPool.query(insertQuery, flatValues);
    }

    // Save table metadata
    const table = await Table.create({
      name: tableName,
      connectionId: null, // Excel upload has no connection
      sourceType: 'excel',
      rowCount: rows.length,
      columnCount: headers.length
    });

    // Clean up uploaded file
    await fs.unlink(filePath);

    res.status(201).json({
      success: true,
      data: {
        tableId: table.id,
        tableName: table.name,
        rowCount: rows.length,
        columnCount: headers.length
      }
    });
  } catch (error) {
    // Clean up on error
    await fs.unlink(filePath).catch(() => {});
    throw new AppError(`File upload failed: ${error.message}`, 500);
  }
});