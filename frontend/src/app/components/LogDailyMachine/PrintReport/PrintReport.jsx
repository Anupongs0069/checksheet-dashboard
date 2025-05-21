// ./src/app/components/PrintReport.jsx

import React, { useState } from "react";
import PrintReportButton from "./PrintReportButton";
import PrintReportTemplate from "./PrintReportTemplate";

const PrintReport = ({ machine }) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [, setChecklist] = useState([]);

  // Function to process checklist items with failing items marked
  const processChecklistItems = (data, attachments, machine) => {
    let items = [];

    console.log("Raw attachments:", attachments);

    // Ensure attachments is an array
    const attachmentsData = attachments.data || attachments;
    console.log("Attachments data:", attachmentsData);

    // Create a map of failing item IDs for quick lookup
    const failingItems = {};
    if (attachmentsData && Array.isArray(attachmentsData)) {
      attachmentsData.forEach(attachment => {
        if (attachment.model_checklist_item_id) {
          const itemId = parseInt(attachment.model_checklist_item_id);
          failingItems[itemId] = {
            id: itemId,
            description: attachment.description || ''
          };
        }
      });
    }

    console.log("Failing items:", failingItems);

    // Create a set of failing item IDs for quick lookup
    const machineStatus = machine.status?.toLowerCase() || "unknown";

    if (data.groups && Array.isArray(data.groups)) {
      data.groups.forEach((group) => {
        if (group.items && Array.isArray(group.items)) {
          const groupName = {
            name: group.group.name,
            thai_name: group.group.thai_name,
          };

          const groupItems = group.items.map((item) => {
            const itemId = parseInt(item.id);
            let itemStatus;
            let itemDescription = '';
            if (failingItems[itemId]) {
              itemStatus = "fail";
              itemDescription = failingItems[itemId].description;
            } else if (machineStatus === "idle") {
              itemStatus = "idle";
            } else {
              itemStatus = "pass";
            }

            console.log(`Item ${item.id} (${item.item_name || "unknown"}): Status=${itemStatus}, Description=${itemDescription}`);

            return {
              id: item.id,
              name: (item.item_name || item.name).replace(/^\d+\.\d+\s+/, ""),
              thai_name: item.item_thai_name || item.thai_name,
              group: groupName,
              status: itemStatus,
              description: itemDescription
            };
          });

          items = [...items, ...groupItems];
        }
      });
    }
    return items;
  };

  // Function to open print window
  const openPrintWindow = (htmlContent) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      // printWindow.close();
    }, 500);
  };

  const handlePrint = async () => {
    // เพิ่ม console.log เพื่อดูข้อมูล machine
    console.log("Machine:", machine);
    
    if (!machine?.machine_name || !machine?.model || !machine?.id) return;

    try {
      setGenerating(true);
      setError(null);

      // ดึงข้อมูล inspection history ด้วย id โดยตรง
      const historyResponse = await fetch(`/api/public/inspections/history/by-id/${machine.id}`);
      const inspectionHistory = await historyResponse.json();
      
      // Log inspection history ที่ได้
      console.log("Inspection History:", inspectionHistory);

      // สร้าง query params จาก inspectionHistory flags ที่เป็น true
      const queryParams = new URLSearchParams({
        machineName: machine.machine_name,
        model: machine.model
      });
      
      // เพิ่ม flags ที่เป็น true ไปใน queryParams
      if (inspectionHistory) {
        if (inspectionHistory.is_daily) queryParams.append('is_daily', 'true');
        if (inspectionHistory.is_weekly) queryParams.append('is_weekly', 'true');
        if (inspectionHistory.is_monthly) queryParams.append('is_monthly', 'true');
        if (inspectionHistory.is_quarterly) queryParams.append('is_quarterly', 'true');
        if (inspectionHistory.is_6_months) queryParams.append('is_6_months', 'true');
        if (inspectionHistory.is_yearly) queryParams.append('is_yearly', 'true');
        
        // ถ้าไม่มี flag ใดๆ เป็น true ให้เพิ่ม is_daily เป็น default
        if (!inspectionHistory.is_daily && !inspectionHistory.is_weekly &&
            !inspectionHistory.is_monthly && !inspectionHistory.is_quarterly &&
            !inspectionHistory.is_6_months && !inspectionHistory.is_yearly) {
          queryParams.append('is_daily', 'true');
        }
      } else {
        // ถ้าไม่มี inspection history ให้ใช้ daily เป็น default
        queryParams.append('is_daily', 'true');
      }

      const queryString = queryParams.toString();
      console.log("Query Params:", queryString);
      console.log("Full Checklist URL:", `/api/public/checklist/items?${queryString}`);

      const [checklistResponse, attachmentsResponse] = await Promise.all([
        fetch(`/api/public/checklist/items?${queryString}`),
        fetch(`/api/public/inspections/${machine.id}/attachments`)
      ]);

      // เพิ่ม logging เพื่อดูรายละเอียดการ request
      console.log("Checklist Request URL:", `/api/public/checklist/items?${queryString}`);

      const data = await checklistResponse.json();
      const attachments = await attachmentsResponse.json();

      console.log("Checklist data:", data);
      console.log("Attachments data:", attachments);

      // Process checklist items with attachment info
      const items = processChecklistItems(data, attachments, machine);
      setChecklist(items);

      // Generate report template
      const reportHTML = PrintReportTemplate({
        machine,
        items,
        overallStatus: machine.status
      });

      // Open print window
      openPrintWindow(reportHTML);

    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return <PrintReportButton onClick={handlePrint} generating={generating} error={error} />;
};

export default PrintReport;