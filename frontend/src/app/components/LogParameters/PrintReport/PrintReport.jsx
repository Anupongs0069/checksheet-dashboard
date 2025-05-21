// .src/app/components/LogParameters/PrintReport/PrintReport.jsx

import React, { useState } from "react";
import PrintReportButton from "./PrintReportButton";
import PrintReportTemplate from "./PrintReportTemplate";
import { findModelId } from "@/app/components/ParametersCheck/utils/apiUtils";

const PrintReport = ({ inspection }) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [parameters, setParameters] = useState([]);

  // Function to process parameter items with failing items marked
  const processParameterItems = (data, attachments, inspection, resultsMap = {}) => {
    let items = [];
  
    // Ensure attachments is an array
    const attachmentsData = Array.isArray(attachments)
      ? attachments
      : attachments.data
      ? attachments.data
      : [];
  
    // Create a map of failing item IDs for quick lookup
    const failingItems = {};
    if (Array.isArray(attachmentsData)) {
      attachmentsData.forEach((attachment) => {
        if (attachment.model_parameterlist_item_id) {
          const itemId = parseInt(attachment.model_parameterlist_item_id);
          failingItems[itemId] = {
            id: itemId,
            description: attachment.description || "",
          };
        }
      });
    }
  
    // Get the inspection status (lowercase for consistency)
    const inspectionStatus = (inspection?.status || "unknown").toLowerCase();
  
    if (data?.groups && Array.isArray(data.groups)) {
      data.groups.forEach((group) => {
        if (group?.items && Array.isArray(group.items)) {
          const groupName = {
            name: group.group?.name || "Default Group",
            thai_name: group.group?.thai_name || "Initial group",
          };
  
          const groupItems = group.items.map((item) => {
            const itemId = parseInt(item.id);
            let itemStatus;
            let itemDescription = "";
            
            // เพิ่มการดึง measured_value จาก resultsMap
            let measuredValue = null;
            if (resultsMap[itemId]) {
              measuredValue = resultsMap[itemId].measured_value;
            }
  
            // Determine item status
            if (failingItems[itemId]) {
              itemStatus = "fail";
              itemDescription = failingItems[itemId].description;
            } else if (inspectionStatus === "idle") {
              itemStatus = "idle";
            } else {
              itemStatus = "pass";
            }
  
            return {
              id: item.id,
              name: (item.item_name || item.name || "").replace(
                /^\d+\.\d+\s+/,
                ""
              ),
              thai_name: item.item_thai_name || item.thai_name || "",
              standard_value: item.standard_value || "",
              tolerance: item.tolerance || "",
              unit: item.unit || "",
              measured_value: measuredValue, // เพิ่มค่า measured_value
              group: groupName,
              status: itemStatus,
              description: itemDescription,
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
    if (!printWindow) {
      setError(
        "Unable to open a new window. Please check your pop-up blocker settings."
      );
      return false;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 1000); 

    return true;
  };

  const handlePrint = async () => {
    if (!inspection?.id || !inspection?.machine_id) {
      setError("Verification data is incomplete.");
      return;
    }
  
    try {
      console.log("==== Print Report Debug ====");
      console.log("Inspection data:", inspection);
      console.log("Inspection ID:", inspection.id);
      console.log("Machine ID:", inspection.machine_id);
      console.log("Program Name:", inspection.program_name || 'Not specified');
  
      setGenerating(true);
      setError(null);
  
      const name = inspection.machine_name || '';
      const model = inspection.model || inspection.machine_model || '';
      
      console.log("Using findModelId with:", { name, model });
      
      const modelIdData = await findModelId(name, model);
      console.log('Model ID Data:', modelIdData);
      
      if (!modelIdData || !modelIdData.machine_model_id) {
        throw new Error("Unable to retrieve machine model ID");
      }
  
      const queryParams = new URLSearchParams({
        machine_model_id: modelIdData.machine_model_id,
        programName: inspection.program_name || ''
      }).toString();
  
      console.log("API Query Parameters:", queryParams);
      console.log("Full Parameter API URL:", `/api/public/simple-parameter-items?${queryParams}`);
      console.log("Full Attachments API URL:", `/api/public/parameter-inspections/${inspection.id}/attachments`);
      console.log("Full Results API URL:", `/api/public/parameter-inspections/${inspection.id}/results`);
  
      const [parameterListResponse, attachmentsResponse, resultsResponse] = await Promise.all([
        fetch(`/api/public/simple-parameter-items?${queryParams}`),
        fetch(`/api/public/parameter-inspections/${inspection.id}/attachments`),
        fetch(`/api/public/parameter-inspections/${inspection.id}/results`) 
      ]);
  
      if (!parameterListResponse.ok) {
        throw new Error(`Unable to retrieve parameter data: ${parameterListResponse.statusText}`);
      }
      
      if (!attachmentsResponse.ok) {
        throw new Error(`Unable to retrieve attachment data: ${attachmentsResponse.statusText}`);
      }
  
      if (!resultsResponse.ok) {
        console.warn(`Unable to retrieve results data: ${resultsResponse.statusText}`);
      }
  
      // แปลงข้อมูลเป็น JSON
      const parameterData = await parameterListResponse.json();
      const attachmentsData = await attachmentsResponse.json();
      let resultsData = [];
      
      try {
        resultsData = await resultsResponse.json();
      } catch (err) {
        console.warn("No results data available or error parsing results:", err);
      }
      
      const resultsMap = {};
      if (Array.isArray(resultsData)) {
        resultsData.forEach(result => {
          resultsMap[result.model_parameterlist_item_id] = result;
        });
      }
      
      console.log("Parameter API Response:", parameterData);
      console.log("Attachments API Response:", attachmentsData);
      console.log("Results API Response:", resultsData);
      console.log("Results Map:", resultsMap);
  
      const items = processParameterItems(parameterData, attachmentsData, inspection, resultsMap);
      console.log("Processed Items:", items);
      
      setParameters(items);
  
      const reportHTML = PrintReportTemplate({
        inspection,
        items,
        overallStatus: inspection.status
      });

      const opened = openPrintWindow(reportHTML);
      if (!opened) {
        setGenerating(false);
      }
  
    } catch (err) {
      console.error("An error occurred:", err);
      setError(err.message || "An error occurred while generating the report.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <PrintReportButton
        onClick={handlePrint}
        generating={generating}
        error={error}
      />
      {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
    </>
  );
};

export default PrintReport;
