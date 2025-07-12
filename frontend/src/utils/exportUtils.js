import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export data to PDF with progress updates
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions { header: 'Header Text', dataKey: 'objectKey' }
 * @param {string} filename - Name of the file to download
 * @param {string} title - Title to display at the top of the PDF
 * @param {Function} onProgress - Callback function for progress updates (0-100)
 * @returns {Promise} - Resolves when export is complete
 */
export const exportToPDF = async (data, columns, filename, title, onProgress) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate inputs
      if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        data = Array.isArray(data) ? data : (data ? [data] : []);
      }

      if (!Array.isArray(columns)) {
        console.error('Columns is not an array:', columns);
        reject(new Error('Columns must be an array'));
        return;
      }

      // Create a new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

      // Prepare table data with error handling
      const tableData = [];
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (!item) continue; // Skip null or undefined items

        const row = [];
        for (let j = 0; j < columns.length; j++) {
          const col = columns[j];
          let value = '';

          try {
            // Handle nested properties
            if (col.dataKey.includes('.')) {
              const keys = col.dataKey.split('.');
              let currentValue = item;
              for (const key of keys) {
                currentValue = currentValue?.[key];
              }
              value = currentValue;
            } else {
              value = item[col.dataKey];
            }

            // Convert undefined or null to empty string
            value = value === undefined || value === null ? '' : value;
          } catch (err) {
            console.error(`Error extracting value for column ${col.dataKey}:`, err);
            value = '';
          }

          row.push(value);
        }

        tableData.push(row);
      }

      // Prepare table headers
      const tableHeaders = columns.map(col => col.header);

      // Process in chunks to show progress
      const chunkSize = Math.max(1, Math.floor(tableData.length / 10)); // 10 chunks
      const chunks = [];

      for (let i = 0; i < tableData.length; i += chunkSize) {
        chunks.push(tableData.slice(i, i + chunkSize));
      }

      // Start progress at 10% (for initialization)
      onProgress(10);

      // Process each chunk with a small delay to allow UI updates
      let processedChunks = 0;

      const processChunk = () => {
        if (processedChunks >= chunks.length) {
          try {
            // All chunks processed, finalize PDF
            doc.save(`${filename}.pdf`);
            onProgress(100);
            resolve();
          } catch (err) {
            console.error('Error saving PDF:', err);
            reject(err);
          }
          return;
        }

        // Update progress (from 10% to 90% during processing)
        const progress = 10 + Math.round((processedChunks / chunks.length) * 80);
        onProgress(progress);

        // Process next chunk
        processedChunks++;

        // Schedule next chunk processing
        setTimeout(processChunk, 100);
      };

      try {
        // Generate the table
        autoTable(doc, {
          head: [tableHeaders],
          body: tableData,
          startY: 40,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [66, 139, 202] }
        });

        // Start processing chunks
        processChunk();
      } catch (err) {
        console.error('Error generating PDF table:', err);
        reject(err);
      }
    } catch (err) {
      console.error('Error in exportToPDF:', err);
      reject(err);
    }
  });
};

/**
 * Export data to XLSX with progress updates
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions { header: 'Header Text', dataKey: 'objectKey' }
 * @param {string} filename - Name of the file to download
 * @param {string} sheetName - Name of the sheet in the Excel file
 * @param {Function} onProgress - Callback function for progress updates (0-100)
 * @returns {Promise} - Resolves when export is complete
 */
export const exportToXLSX = async (data, columns, filename, sheetName, onProgress) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate inputs
      if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        data = Array.isArray(data) ? data : (data ? [data] : []);
      }

      if (!Array.isArray(columns)) {
        console.error('Columns is not an array:', columns);
        reject(new Error('Columns must be an array'));
        return;
      }

      // Start progress at 10% (for initialization)
      onProgress(10);

      // Prepare worksheet data
      const wsData = [
        // Header row
        columns.map(col => col.header || '')
      ];

      // Process in chunks to show progress
      const chunkSize = Math.max(1, Math.floor(data.length / 10)); // 10 chunks
      const chunks = [];

      for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
      }

      let processedChunks = 0;

      const processChunk = () => {
        if (processedChunks >= chunks.length) {
          try {
            // All chunks processed, finalize XLSX
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Sheet1');

            // Generate Excel file
            XLSX.writeFile(wb, `${filename}.xlsx`);

            onProgress(100);
            resolve();
          } catch (err) {
            console.error('Error generating Excel file:', err);
            reject(err);
          }
          return;
        }

        // Update progress (from 10% to 90% during processing)
        const progress = 10 + Math.round((processedChunks / chunks.length) * 80);
        onProgress(progress);

        // Process current chunk
        const chunk = chunks[processedChunks];

        // Add data rows for this chunk
        for (let i = 0; i < chunk.length; i++) {
          const item = chunk[i];
          if (!item) continue; // Skip null or undefined items

          const row = [];
          for (let j = 0; j < columns.length; j++) {
            const col = columns[j];
            let value = '';

            try {
              // Handle nested properties
              if (col.dataKey.includes('.')) {
                const keys = col.dataKey.split('.');
                let currentValue = item;
                for (const key of keys) {
                  currentValue = currentValue?.[key];
                }
                value = currentValue;
              } else {
                value = item[col.dataKey];
              }

              // Convert undefined or null to empty string
              value = value === undefined || value === null ? '' : value;
            } catch (err) {
              console.error(`Error extracting value for column ${col.dataKey}:`, err);
              value = '';
            }

            row.push(value);
          }

          wsData.push(row);
        }

        // Process next chunk
        processedChunks++;

        // Schedule next chunk processing
        setTimeout(processChunk, 100);
      };

      // Start processing chunks
      processChunk();
    } catch (err) {
      console.error('Error in exportToXLSX:', err);
      reject(err);
    }
  });
};
