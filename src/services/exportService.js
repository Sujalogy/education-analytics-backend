const ExcelJS = require('exceljs');
const Papa = require('papaparse');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

class ExportService {
  /**
   * Generates an Excel Workbook buffer
   */
  async exportToExcel(data, config = {}) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      
      // Add Title row
      if (config.title) {
        sheet.mergeCells('A1', `${String.fromCharCode(64 + headers.length)}1`);
        const titleRow = sheet.getRow(1);
        titleRow.value = config.title;
        titleRow.font = { size: 16, bold: true };
        titleRow.alignment = { horizontal: 'center' };
      }

      // Add Headers
      const headerRowIndex = config.title ? 3 : 1;
      const headerRow = sheet.getRow(headerRowIndex);
      headerRow.values = headers;
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };

      // Add Data
      data.forEach((row, i) => {
        sheet.addRow(headers.map(h => row[h]));
      });

      // Auto-fit Columns
      sheet.columns.forEach(column => {
        column.width = 20;
      });
    }

    // Add separate sheet for full Statistics if provided
    if (config.statistics) {
      const statSheet = workbook.addWorksheet('Detailed Statistics');
      statSheet.addRow(['Metric', 'Value']);
      Object.entries(config.statistics).forEach(([k, v]) => {
        if (typeof v !== 'object') statSheet.addRow([k, v]);
      });
    }

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Generates a CSV buffer
   */
  async exportToCSV(data) {
    const csv = Papa.unparse(data);
    return Buffer.from(csv, 'utf-8');
  }

  /**
   * Generates a PDF buffer
   */
  async exportToPDF(data, stats = null, chartImage = null, title = 'Analytics Report') {
    const doc = new jsPDF();

    // 1. Title & Date
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text(title, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 30);

    // 2. Summary Statistics Section
    let startY = 40;
    if (stats) {
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text('Key Metrics', 14, startY);
      
      const statRows = [
        ['Mean', stats.mean?.toFixed(2) || 'N/A', 'Median', stats.median?.toFixed(2) || 'N/A'],
        ['Std Dev', stats.stdDev?.toFixed(2) || 'N/A', 'Sample Size (n)', stats.count || '0']
      ];

      doc.autoTable({
        body: statRows,
        startY: startY + 5,
        theme: 'plain',
        styles: { fontSize: 10 }
      });
      startY = doc.lastAutoTable.finalY + 15;
    }

    // 3. Data Table
    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(h => row[h]));

      doc.autoTable({
        head: [headers],
        body: rows,
        startY: startY,
        theme: 'grid',
        headStyles: { fillColor: [68, 114, 196] },
        styles: { fontSize: 8 }
      });
    }

    // 4. Chart Image
    if (chartImage) {
      const finalY = doc.lastAutoTable.finalY + 10;
      // Check if chart fits on page
      if (finalY + 80 > doc.internal.pageSize.height) {
        doc.addPage();
        doc.addImage(chartImage, 'PNG', 15, 20, 180, 90);
      } else {
        doc.addImage(chartImage, 'PNG', 15, finalY, 180, 90);
      }
    }

    return Buffer.from(doc.output('arraybuffer'));
  }
}

module.exports = new ExportService();