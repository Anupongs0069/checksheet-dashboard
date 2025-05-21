// src/app/components/PrintSafetyReport.jsx

import React, { useState } from "react";
import PrintSafetyReportButton from "./PrintSafetyReportButton";
import PrintSafetyReportTemplate from "./PrintSafetyReportTemplate";

const PrintSafetyReport = ({ machine }) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [, setChecklist] = useState([]);

  // Function to determine frequency based on current date
  const getFrequency = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const month = today.getMonth();
    const isFirstMonday = dayOfWeek === 1 && today.getDate() <= 7;
    const isFirstDayOfQuarter =
      today.getDate() === 1 &&
      (month === 0 || month === 3 || month === 6 || month === 9);
    const isFirstDayOfHalfYear =
      today.getDate() === 1 && (month === 0 || month === 6);
    const isFirstDayOfYear = today.getDate() === 1 && month === 0;

    switch (true) {
      case isFirstDayOfYear:
        return "yearly";
      case isFirstDayOfHalfYear:
        return "6_months";
      case isFirstDayOfQuarter:
        return "quarterly";
      case isFirstMonday:
        return "monthly";
      case dayOfWeek === 1:
        return "weekly";
      default:
        return "daily";
    }
  };

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
        if (attachment.model_safetylist_item_id) {
          const itemId = parseInt(attachment.model_safetylist_item_id);
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
    if (!machine?.machine_name || !machine?.model) return;

    try {
      setGenerating(true);
      setError(null);

      const queryParams = new URLSearchParams({
        frequency: getFrequency(),
        machineName: machine.machine_name,
        model: machine.model
      }).toString();

      console.log("Requesting API:", `/api/public/safetychecklist/items?${queryParams}`);
      console.log("Machine ID for attachments:", machine.id);

      const [checklistResponse, attachmentsResponse] = await Promise.all([
        fetch(`/api/public/safetychecklist/items?${queryParams}`),
        fetch(`/api/public/safety-inspections/${machine.id}/attachments`)
      ]);

      console.log("Checklist Response Status:", checklistResponse.status);
      console.log("Attachments Response Status:", attachmentsResponse.status);

      if (!checklistResponse.ok) throw new Error('Failed to fetch checklist');
      if (!attachmentsResponse.ok) throw new Error('Failed to fetch attachments');

      const data = await checklistResponse.json();
      const attachments = await attachmentsResponse.json();

      console.log("Checklist data:", data);
      console.log("Attachments data:", attachments);

      // Process checklist items with attachment info
      const items = processChecklistItems(data, attachments, machine);
      setChecklist(items);

      // Generate report template
      const reportHTML = PrintSafetyReportTemplate({
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

  return <PrintSafetyReportButton onClick={handlePrint} generating={generating} error={error} />;
};

export default PrintSafetyReport;