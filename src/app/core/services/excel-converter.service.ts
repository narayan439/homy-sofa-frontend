// services/excel-converter.service.ts
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelConverterService {

  constructor() { }

  /**
   * Convert JSON data to Excel and trigger download
   * @param data Array of objects to export
   * @param filename Name of the Excel file (without extension)
   * @param sheetName Name of the sheet in Excel
   */
  exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1'): void {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      // Create worksheet
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      
      // Auto-calculate column widths based on content
      this.autoSizeColumns(worksheet);
      
      // Create workbook
      const workbook: XLSX.WorkBook = { 
        Sheets: { [sheetName]: worksheet }, 
        SheetNames: [sheetName] 
      };

      // Generate Excel buffer
      const excelBuffer: any = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      });

      // Save the file
      this.saveAsExcelFile(excelBuffer, filename);

    } catch (error) {
      console.error('Excel export error:', error);
      throw error;
    }
  }

  /**
   * Convert JSON data to CSV and trigger download
   * @param data Array of objects to export
   * @param filename Name of the CSV file (without extension)
   */
  exportToCSV(data: any[], filename: string): void {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      // Convert JSON to CSV
      const csvData = this.convertToCSV(data);
      
      // Create blob
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      
      // Save file
      saveAs(blob, `${filename}.csv`);

    } catch (error) {
      console.error('CSV export error:', error);
      throw error;
    }
  }

  /**
   * Auto-size columns based on content
   * @param worksheet Excel worksheet
   */
  private autoSizeColumns(worksheet: XLSX.WorkSheet): void {
    if (!worksheet['!ref']) return;

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const columnWidths: number[] = [];

    // Calculate max width for each column
    for (let col = range.s.c; col <= range.e.c; col++) {
      let maxLength = 0;
      
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v) {
          const cellLength = cell.v.toString().length;
          maxLength = Math.max(maxLength, cellLength);
        }
      }
      
      // Add some padding
      columnWidths.push(Math.min(maxLength + 2, 50));
    }

    worksheet['!cols'] = columnWidths.map(width => ({ wch: width }));
  }

  /**
   * Save Excel file
   * @param buffer Excel buffer data
   * @param fileName Name of the file
   */
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    
    // Use FileSaver to save the file
    saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
  }

  /**
   * Convert JSON array to CSV string
   * @param objArray Array of objects
   * @returns CSV string
   */
  private convertToCSV(objArray: any[]): string {
    if (objArray.length === 0) return '';

    // Get headers from first object
    const headers = Object.keys(objArray[0]);
    
    // Create CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...objArray.map(row => 
        headers.map(fieldName => 
          this.csvEscape(row[fieldName] || '')
        ).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  /**
   * Escape CSV fields properly
   * @param field Field value
   * @returns Escaped field value
   */
  private csvEscape(field: any): string {
    if (field === null || field === undefined) {
      return '';
    }
    
    const stringField = String(field);
    
    // Escape double quotes and wrap in quotes if contains commas, quotes, or newlines
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    
    return stringField;
  }

  /**
   * Read Excel file and convert to JSON
   * @param file File object
   * @returns Promise with array of objects
   */
  async readExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Download Excel template for bookings
   * @param filename Name of the template file
   */
  downloadTemplate(filename: string = 'booking_template'): void {
    const templateData = [{
      'Customer Name': 'John Doe',
      'Email': 'john@example.com',
      'Phone': '9876543210',
      'Service Type': 'Sofa Cleaning',
      'Service Date': '2024-12-25',
      'Time Slot': 'morning',
      'Address': '123 Main Street, City, Pincode',
      'Special Instructions': 'Please call before arrival',
      'Status': 'PENDING'
    }];
    
    this.exportToExcel(templateData, filename, 'Template');
  }
}