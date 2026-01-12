import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  format?: string;
}

export const exportToExcel = async (
  data: Record<string, unknown>[],
  columns: ExcelColumn[],
  fileName: string,
  sheetName: string = 'Reporte'
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Set columns
  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
  }));

  // Add rows
  worksheet.addRows(data);

  // Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = { 
      bold: true, 
      color: { argb: 'FFFFFFFF' },
      size: 12
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' } // Indigo 600
    };
    cell.alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'medium', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };
  });

  // Style Data Rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.height = 20;
      
      // Zebra striping
      if (rowNumber % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' } // Zinc 50
          };
        });
      }

      row.eachCell((cell, colNumber) => {
        const colDef = columns[colNumber - 1];
        
        // Alignment
        cell.alignment = { 
          vertical: 'middle', 
          horizontal: 'left',
          wrapText: true 
        };

        // Number format
        if (colDef.format) {
          cell.numFmt = colDef.format;
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        }

        // Borders
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
      });
    }
  });

  // Auto-filter for all columns
  worksheet.autoFilter = {
    from: {
      row: 1,
      column: 1
    },
    to: {
      row: 1,
      column: columns.length
    }
  };

  // Generate buffer and save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}.xlsx`);
};
