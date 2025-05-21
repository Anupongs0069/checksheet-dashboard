// ./src/app/components/LogParameters/PrintReport/PrintReportTemplate.jsx


"use client";

const PrintReportTemplate = ({ inspection, items, overallStatus }) => {
  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  // Get current date and time for the report generation timestamp
  const getCurrentDateTime = () => {
    const options = { 
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date().toLocaleDateString('en-GB', options);
  };

  // Group items by their group name
  const groupedItems = items.reduce((acc, item) => {
    const groupName = item.group.name;
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(item);
    return acc;
  }, {});

  const getStatusClass = (status) => {
    switch (status?.toLowerCase() || 'idle') {
      case "pass":
        return "status-pass";
      case "fail":
        return "status-fail";
      case "idle":
        return "status-idle";
      default:
        return "";
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Parameter Inspection Report</title>
      <style>
        @font-face {
          font-family: 'Noto Sans Thai';
          src: url('/static/fonts/NotoSansThai.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
        }
        
        body {
          font-family: system-ui, -apple-system, sans-serif;
          padding: 40px;
          max-width: 210mm;
          margin: 0 auto;
          background-color: #ffffff;
          color: #1a1a1a;
          line-height: 1.6;
        }
        .thai-text {
          font-family: 'Noto Sans Thai', system-ui, -apple-system, sans-serif;
        }
        .header {
          margin-bottom: 40px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 25px;
          text-align: center;
        }
        .report-title {
          font-size: 32px;
          color: #1e40af;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 12px;
          font-weight: 700;
        }
        .date-text {
          font-size: 12px;
          color: #6b7280;
        }
        .section {
          margin-bottom: 30px;
          background-color: #f8fafc;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .section-title {
          font-size: 18px;
          color: #1e40af;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          border-left: 4px solid #3b82f6;
          padding-left: 12px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .label {
          font-size: 10px;
          color: #6b7280;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .value {
          font-size: 12px;
          color: #111827;
        }
        .parameter-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 10px;
        }
        .parameter-table th {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 8px 10px;
          text-align: left;
          color: #1e40af;
          font-weight: 600;
          font-size: 10px;
        }
        .parameter-table td {
          border: 1px solid #e2e8f0;
          padding: 8px 10px;
          font-size: 10px;
        }
        .status {
          font-size: 11px;
          font-weight: bold;
          padding: 4px;
          border-radius: 4px;
          display: inline-block;
          text-align: center;
        }
        .status-pass {
          color: #059669;
          background-color: #d1fae5;
        }
        .status-fail {
          color: #dc2626;
          background-color: #fee2e2;
        }
        .status-idle {
          color: #ca8a04;
          background-color: #fef9c3;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #9ca3af;
          font-size: 10px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        .parameter-group {
          margin-bottom: 30px;
        }
        .group-title {
          font-size: 14px;
          color: #1e3a8a;
          font-weight: bold;
          margin-bottom: 15px;
          border-left: 4px solid #3b82f6;
          padding-left: 10px;
        }
        .signature-container {
          display: flex;
          justify-content: space-between;
          margin-top: 60px;
          margin-bottom: 20px;
        }
        .signature {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-bottom: 8px;
        }
        .signature-text {
          font-size: 12px;
          color: #4b5563;
        }
        @media print {
          body {
            padding: 20px;
          }
          .section {
            break-inside: avoid;
          }
          .parameter-group {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="report-title">Parameter Inspection Report</h1>
        <div class="date-text">Generated on: ${getCurrentDateTime()}</div>
      </div>
      
      <div class="section">
        <h2 class="section-title">Inspection Details</h2>
        
        <div class="info-grid">
          <div class="info-item">
            <div class="label">Machine Name</div>
            <div class="value">${inspection.machine_name || "N/A"}</div>
          </div>
          
          <div class="info-item">
            <div class="label">Machine Number</div>
            <div class="value">${inspection.machine_number || "N/A"}</div>
          </div>
          
          <div class="info-item">
            <div class="label">Model</div>
            <div class="value">${inspection.model || "N/A"}</div>
          </div>
          
          <div class="info-item">
            <div class="label">Customer</div>
            <div class="value">${inspection.customer || "N/A"}</div>
          </div>
          
          <div class="info-item">
            <div class="label">Product</div>
            <div class="value">${inspection.product || "N/A"}</div>
          </div>
          
          <div class="info-item">
            <div class="label">Program Name</div>
            <div class="value">${inspection.program_name || "N/A"}</div>
          </div>
          
          <div class="info-item">
            <div class="label">Work Order</div>
            <div class="value">${inspection.work_order || "N/A"}</div>
          </div>
          
          <div class="info-item">
            <div class="label">Shift</div>
            <div class="value">${inspection.shift || "N/A"}</div>
          </div>
          
          <div class="info-item">
            <div class="label">Checked By</div>
            <div class="value">${inspection.checked_by || "N/A"}</div>
          </div>

          <div class="info-item">
            <div class="label">Inspection Date</div>
            <div class="value">${formatDate(inspection.checked_at)}</div>
          </div>
          
          <div class="info-item">
            <div class="label">Overall Status</div>
            <div class="value">
              <span class="status ${getStatusClass(overallStatus)}">${(overallStatus || "N/A").toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Parameter Inspection Results</h2>
        
        ${Object.entries(groupedItems).map(([groupName, groupItems]) => `
          <div class="parameter-group">
            <!-- <div class="group-title">${groupName}</div> -->
            
            <table class="parameter-table">
              <thead>
                <tr>
                  <th style="text-align: center;">Parameter</th>
                  <th style="text-align: center;">Thai Parameter</th>
                  <th style="text-align: center;">Standard Value<br>(±Tolerance)</th>
                  <th style="text-align: center;">Measured<br>Value</th>
                  <th style="text-align: center;">Unit</th>
                  <th style="text-align: center;">Status</th>
                  <th style="text-align: center;">Description</th>
                </tr>
              </thead>
              <tbody>
                ${groupItems.map(item => `
                  <tr>
                    <td>${item.name || "N/A"}</td>
                    <td class="thai-text">${item.thai_name || "N/A"}</td>
                    <td>${item.standard_value || "N/A"} (±${item.tolerance || "0"})</td>
                    <td>${item.measured_value || "-"}</td>
                    <td>${item.unit || "N/A"}</td>
                    <td style="text-align: center;">
                      <span class="status ${getStatusClass(item.status)}">${(item.status || "N/A").toUpperCase()}</span>
                    </td>
                    <td>${item.description || "-"}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        This is an automatically generated report. Please verify all information for accuracy.
      </div>
    </body>
    </html>
  `;
};

export default PrintReportTemplate;