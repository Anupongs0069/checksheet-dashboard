// ./src/app/components/LogCheckQuality/PrintReport/PrintReportTemplate.jsx

"use client";

const PrintReportTemplate = ({
  inspection,
  inspectionItems,
  measurements,
  machineInfo,
  qualityItemsMap = {},
}) => {
  // เพิ่มการ log เพื่อดูข้อมูลสำหรับดีบัก
  console.log("Inspection:", inspection);
  console.log("Inspection Items:", inspectionItems);
  console.log("Measurements:", measurements);
  console.log("Machine Info:", machineInfo);
  console.log(
    "Quality items map in Template:",
    JSON.stringify(qualityItemsMap, null, 2)
  );

  // เพิ่มการ log เพื่อตรวจสอบค่า quality_item_id ในแต่ละ measurement
  if (measurements && measurements.length > 0) {
    console.log(
      "Quality Item IDs in measurements:",
      measurements.map((m) => m.quality_item_id)
    );
  }

  // เพิ่มการ log keys ทั้งหมดใน qualityItemsMap
  console.log("Keys in qualityItemsMap:", Object.keys(qualityItemsMap));

  // ฟังก์ชันสำหรับสร้าง URL ของรูปภาพคล้ายกับใน ImageDisplay.jsx
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return '/api/images/No Image Available.webp';
    }
    
    // ถ้ารูปภาพเริ่มต้นด้วย http/https ให้ใช้โดยตรง
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // มิฉะนั้นใช้ API path
    return `/api/images/${imagePath}`;
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
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
    <html>
      <head>
        <title>Quality Inspection Report</title>
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
          .measurement-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 10px;
          }
          .measurement-table th {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 8px 10px;
            text-align: left;
            color: #1e40af;
            font-weight: 600;
            font-size: 10px;
          }
          .measurement-table td {
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
          @media print {
            body {
              padding: 20px;
            }
            .section {
              break-inside: avoid;
            }
            .item-section {
              break-inside: avoid;
            }
          }
          
          .item-container {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #ffffff;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          
          .item-header {
            margin-bottom: 15px;
          }
          
          .item-title-en {
            font-size: 14px;
            color: #1e3a8a;
            font-weight: bold;
            margin-bottom: 2px;
          }
          
          .item-title-th {
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 10px;
          }
          
          .item-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          
          .detail-item {
            margin-bottom: 8px;
          }
          
          .detail-label {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          
          .detail-value {
            font-size: 12px;
            color: #111827;
          }
          
          .flex-container {
            display: flex;
            margin-bottom: 15px;
          }
          
          .reference-image {
            width: 33%;
            padding: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .image-container {
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 8px;
            background-color: #ffffff;
            display: inline-block;
          }
          
          .reference-img {
            max-height: 120px;
            max-width: 100%;
            object-fit: contain;
          }
          
          .specifications {
            width: 67%;
            padding: 10px;
          }
          
          .spec-box {
            padding: 12px;
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            border-radius: 4px;
            height: 100%;
          }
          
          .spec-title {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 5px;
            color: #1e3a8a;
          }
          
          .spec-text {
            font-size: 11px;
            color: #111827;
            margin-bottom: 5px;
          }
          
          .spec-range {
            font-size: 10px;
            color: #4b5563;
            margin-top: 5px;
          }
          
          .measurement-header {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #1e3a8a;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="report-title">Quality Inspection Report</h1>
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
          <h2 class="section-title">Inspection Details</h2>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="label">Machine Name</div>
              <div class="value">${machineInfo?.machine_name || "N/A"}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Machine Number</div>
              <div class="value">${machineInfo?.machine_number || "N/A"}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Model</div>
              <div class="value">${machineInfo?.model || "Machine"}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Customer</div>
              <div class="value">${machineInfo?.customer || "N/A"}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Product</div>
              <div class="value">${machineInfo?.product || "N/A"}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Inspection Date</div>
              <div class="value">${new Date(
                inspection.inspection_date
              ).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })} (${inspection.shift})</div>
            </div>
            
            <div class="info-item">
              <div class="label">Work Order</div>
              <div class="value">${inspection.work_order || "N/A"}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Barcode Unit</div>
              <div class="value">${inspection.barcode_unit || "N/A"}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Lead Employee ID</div>
              <div class="value">${inspection.lead_employee_id || "N/A"}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Inspector ID</div>
              <div class="value">${inspection.employee_id || "N/A"}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Overall Status</div>
              <div class="value">
                <span class="status ${getStatusClass(
                  inspection.overall_result
                )}">${inspection.overall_result.toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          ${
            inspection.remarks
              ? `
          <div style="margin-top: 15px;">
            <div class="label">Remarks</div>
            <div class="value" style="font-size: 11px;">${inspection.remarks}</div>
          </div>
          `
              : ""
          }
        </div>

        <div class="section">
          <h2 class="section-title">Measurement Results</h2>
          ${
            measurements.length > 0
              ? measurements
                  .map((item, index) => {
                    console.log("Item:", item);
                    console.log("Quality Item ID:", item.quality_item_id);
                    console.log("QualityItemsMap Keys:", Object.keys(qualityItemsMap));
                    
                    // ตรวจสอบวิธีการเข้าถึงข้อมูล quality item
                    const qualityItemFromMap = qualityItemsMap[item.quality_item_id];
                    const firstQualityItemKey = Object.keys(qualityItemsMap)[0];
                    const qualityItemFromFirst = qualityItemsMap[firstQualityItemKey];
                    
                    console.log("Quality Item from Map by ID:", qualityItemFromMap);
                    console.log("First Quality Item Key:", firstQualityItemKey);
                    console.log("Quality Item from First Key:", qualityItemFromFirst);
                    
                    // ใช้ qualityItem จาก ID ถ้ามี มิฉะนั้นใช้ตัวแรก
                    const qualityItem = qualityItemFromMap || qualityItemFromFirst || {};
                    const hasReferenceImage = qualityItem?.referenceImageUrl;

                    return `
                  <div class="item-container">
                    <div class="item-header">
                      <div class="item-title-en">${
                        qualityItem.item || item.item || `Item ${index + 1}`
                      }</div>
                      ${
                        qualityItem.thaiItem
                          ? `<div class="item-title-th thai-text">${qualityItem.thaiItem}</div>`
                          : ""
                      }
                    </div>

                    <div class="flex-container">
                      ${
                        hasReferenceImage
                          ? `
                          <div class="reference-image">
                            <div class="image-container">
                              <img 
                                src="${getImageUrl(qualityItem.referenceImageUrl)}" 
                                alt="Reference Image" 
                                class="reference-img"
                              />
                            </div>
                          </div>
                          <div class="specifications">
                            <div class="spec-box">
                              <div class="spec-title">Specifications</div>
                              <div class="spec-text">
                                Standard Value: ${parseFloat(item.standard_value).toFixed(3)} ${item.unit} 
                                Acceptable Tolerance: ±${parseFloat(item.tolerance).toFixed(3)} ${item.unit}
                              </div>
                              <div class="spec-range">
                                Acceptable Range: 
                                ${(parseFloat(item.standard_value) - parseFloat(item.tolerance)).toFixed(3)} ${item.unit} - 
                                ${(parseFloat(item.standard_value) + parseFloat(item.tolerance)).toFixed(3)} ${item.unit}
                              </div>
                            </div>
                          </div>
                        `
                          : `
                          <div class="specifications" style="width: 100%;">
                            <div class="spec-box">
                              <div class="spec-title">Specifications</div>
                              <div class="spec-text">
                                Standard Value: ${parseFloat(item.standard_value).toFixed(3)} ${item.unit} 
                                Acceptable Tolerance: ±${parseFloat(item.tolerance).toFixed(3)} ${item.unit}
                              </div>
                              <div class="spec-range">
                                Acceptable Range: 
                                ${(parseFloat(item.standard_value) - parseFloat(item.tolerance)).toFixed(3)} ${item.unit} - 
                                ${(parseFloat(item.standard_value) + parseFloat(item.tolerance)).toFixed(3)} ${item.unit}
                              </div>
                            </div>
                          </div>
                        `
                      }
                    </div>

                    <div class="measurement-header">Measurement Results</div>
                    
                    <table class="measurement-table">
                      <thead>
                        <tr>
                          <th style="width: 15%; text-align: center;">Point #</th>
                          <th style="width: 60%;">Measured Value</th>
                          <th style="width: 25%; text-align: center;">Status</th>
                          ${
                            item.measurements.some((m) => m.issue_detail)
                              ? '<th style="width: 20%;">Issue Detail</th>'
                              : ""
                          }
                        </tr>
                      </thead>
                      <tbody>
                        ${item.measurements
                          .map(
                            (measurement) => `
                          <tr>
                            <td style="text-align: center;">${
                              measurement.point_number
                            }</td>
                            <td>${measurement.measured_value} ${item.unit}</td>
                            <td style="text-align: center;"><span class="status ${getStatusClass(
                              measurement.status
                            )}">${measurement.status.toUpperCase()}</span></td>
                            ${
                              measurement.issue_detail
                                ? `<td>${measurement.issue_detail}</td>`
                                : item.measurements.some((m) => m.issue_detail)
                                ? "<td>-</td>"
                                : ""
                            }
                          </tr>
                        `
                          )
                          .join("")}
                      </tbody>
                    </table>
                  </div>`;
                  })
                  .join("")
              : `
                      <div class="item-container">
                        <p style="font-size: 12px; color: #6b7280;">No measurement data available for this inspection.</p>
                      </div>
                    `
          }
        </div>

        <div class="footer">
          This is an automatically generated report. Please verify all information for accuracy.
        </div>
      </body>
    </html>
  `;
};

export default PrintReportTemplate;