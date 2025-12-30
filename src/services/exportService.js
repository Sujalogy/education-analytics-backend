const ExcelJS = require('exceljs');
const Papa = require('papaparse');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

class ExportService {
  async exportToExcel(data, config) {
    const workbook = new ExcelJS.Workbook();
    
    // Main data sheet
    const dataSheet = workbook.addWorksheet('Data');
    
    if (data && data.length > 0) {
      // Add headers
      const headers = Object.keys(data[0]);
      dataSheet.addRow(headers);
      
      // Style headers
      dataSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      dataSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      
      // Add data rows
      data.forEach(row => {
        const values = headers.map(header => row[header]);
        dataSheet.addRow(values);
      });
      
      // Auto-fit columns
      dataSheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const length = cell.value ? cell.value.toString().length : 0;
          if (length > maxLength) maxLength = length;
        });
        column.width = Math.min(maxLength + 2, 50);
      });
    }

    // Add filters sheet if configured
    if (config && config.includeFilters && config.filters) {
      const filtersSheet = workbook.addWorksheet('Filters');
      filtersSheet.addRow(['Column', 'Selected Values']);
      filtersSheet.getRow(1).font = { bold: true };
      
      Object.entries(config.filters).forEach(([column, values]) => {
        filtersSheet.addRow([column, values.join(', ')]);
      });
    }

    // Add statistics sheet if configured
    if (config && config.includeStatistics && config.statistics) {
      const statsSheet = workbook.addWorksheet('Statistics');
      statsSheet.addRow(['Metric', 'Value']);
      statsSheet.getRow(1).font = { bold: true };
      
      Object.entries(config.statistics).forEach(([metric, value]) => {
        statsSheet.addRow([metric, value]);
      });
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async exportToCSV(data) {
    const csv = Papa.unparse(data);
    return Buffer.from(csv, 'utf-8');
  }

  async exportToPDF(data, stats, chartImage) {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Education Analytics Report', 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    // Add statistics if provided
    if (stats) {
      doc.setFontSize(14);
      doc.text('Statistics', 14, 45);
      doc.setFontSize(10);
      
      let yPos = 55;
      Object.entries(stats).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 14, yPos);
        yPos += 7;
      });
    }

    // Add table
    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(header => row[header]));
      
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: stats ? 100 : 45,
        theme: 'grid',
        headStyles: { fillColor: [68, 114, 196] }
      });
    }

    // Add chart if provided
    if (chartImage) {
      const finalY = doc.lastAutoTable.finalY || 100;
      if (finalY + 100 < doc.internal.pageSize.height) {
        doc.addImage(chartImage, 'PNG', 14, finalY + 10, 180, 100);
      } else {
        doc.addPage();
        doc.addImage(chartImage, 'PNG', 14, 20, 180, 100);
      }
    }

    return doc.output('arraybuffer');
  }
}

module.exports = new ExportService();