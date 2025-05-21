// src/app/components/PrintSafetyReport/PrintSafetyReportTemplate.jsx

"use client";

const PrintSafetyReportTemplate = ({ machine, items, overallStatus }) => {
  console.log("Machine:", machine);
  console.log("Items:", items);
  console.log("Overall Status:", overallStatus);
  return `
    <html>
      <head>
        <title>Machine Inspection Report</title>
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
          .group-section {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f8fafc;
            border-radius: 4px;
          }
          .group-title {
            font-size: 14px;
            color: #1e3a8a;
            margin-bottom: 4px;
            font-weight: bold;
          }
          .group-subtitle {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 10px;
          }
          .checklist-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
            padding: 12px 16px;
            background-color: #ffffff;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            transition: all 0.2s ease;
            flex-wrap: wrap;
          }
          .checklist-item:hover {
            border-color: #93c5fd;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
          }
          .item-number {
            font-size: 12px;
            color: #6b7280;
            margin-right: 8px;
            width: 25px;
          }
          .item-name {
            flex: 1;
            font-size: 11px;
            color: #374151;
          }
          .item-thai-name {
            font-size: 10px;
            color: #6b7280;
          }
          .item-description {
            width: 100%;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #e5e7eb;
            font-size: 10px;
            color: #dc2626;
            font-style: italic;
          }
          .status {
            font-size: 11px;
            font-weight: bold;
            padding: 4px;
            border-radius: 4px;
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
          @media print {
            body {
              padding: 20px;
            }
            .section {
              break-inside: avoid;
            }
            .group-section {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="report-title">Machine Inspection Report</h1>
          <div class="date-text">Generated on: ${new Date().toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }
          )}</div>
        </div>

        <div class="section">
          <h2 class="section-title">Machine Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="label">Machine Name</div>
              <div class="value">${machine.machine_name}</div>
            </div>
            <div class="info-item">
              <div class="label">Machine Number</div>
              <div class="value">${machine.machine_number}</div>
            </div>
            <div class="info-item">
              <div class="label">Model</div>
              <div class="value">${machine.model}</div>
            </div>
            <div class="info-item">
              <div class="label">Customer</div>
              <div class="value">${machine.customer}</div>
            </div>
            <div class="info-item">
              <div class="label">Product</div>
              <div class="value">${machine.product}</div>
            </div>
            <div class="info-item">
              <div class="label">Inspection Date</div>
              <div class="value">${new Date(
                machine.last_check
              ).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })} (${new Date(machine.last_check).toLocaleTimeString(
                "en-GB",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )})</div>
            </div>
            <div class="info-item">
              <div class="label">Overall Status</div>
              <div class="value">${(machine.status || "unknown").toUpperCase()}</div>
            </div>
            <div class="info-item">
              <div class="label">Inspector ID</div>
              <div class="value">${machine.checked_by}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Inspection Checklist</h2>
          ${Object.values(
            items.reduce((acc, item) => {
              const groupName = item.group.name;
              if (!acc[groupName]) {
                acc[groupName] = {
                  name: item.group.name,
                  thai_name: item.group.thai_name,
                  items: [],
                };
              }
              acc[groupName].items.push(item);
              return acc;
            }, {})
          )
            .map(
              (group, groupIndex) => `
                <div class="group-section">
                  <div class="group-title">${group.name}</div>
                  <div class="group-subtitle thai-text">${group.thai_name}</div>
                  ${group.items
                    .map(
                      (item, itemIndex) => `
                        <div class="checklist-item">
                          <div class="item-number">${String(itemIndex + 1).padStart(
                        2,
                        "0"
                      )}</div>
                          <div class="item-name">
                            <div>${item.name}</div>
                            <div class="item-thai-name thai-text">${item.thai_name}</div>
                          </div>
                          <div class="status status-${item.status}">
                            ${(item.status || "unknown").toUpperCase()}
                          </div>
                          ${item.status === 'fail' && item.description 
                            ? `<div class="item-description">Issue: ${item.description}</div>` 
                            : ''
                          }
                        </div>
                      `
                    )
                    .join("")}
                </div>
              `
            )
            .join("")}
        </div>

        <div class="footer">
          This is an automatically generated report. Please verify all information for accuracy.
        </div>
      </body>
    </html>
  `;
};

export default PrintSafetyReportTemplate;