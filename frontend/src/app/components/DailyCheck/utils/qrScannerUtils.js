// src/app/components/DailyCheck/utils/qrScannerUtils.js

/**
 * Parse QR code data for machine details
 * 
 * @param {string} scannedData - Raw data from QR code scanner
 * @returns {Object|null} Extracted machine data or null if invalid format
 */
export const parseQrCodeData = (scannedData) => {
  try {
    console.log('Raw QR Data:', scannedData);
    const pattern = /Machine_Name: \[(.*?)\] ,Machine_Number: \[(.*?)\] ,Model: \[(.*?)\]/i;
    const matches = scannedData.match(pattern);

    console.log('Pattern Matches:', matches);

    if (matches && matches.length === 4) {
      const [_, name, number, model] = matches;

      console.log('Extracted Data:', {
        name,
        number,
        model
      });

      return {
        name,
        number,
        model
      };
    }
    
    return null;
  } catch (err) {
    console.error('QR Parsing Error:', err);
    return null;
  }
};