// ./src/app/components/LogCheckQuality/PrintReport/PrintReport.jsx
"use client";
import React, { useState } from "react";
import PrintReportButton from "./PrintReportButton";
import PrintReportTemplate from "./PrintReportTemplate";

const PrintReport = ({ inspection }) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Function to open print window
  const openPrintWindow = (htmlContent) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError(
        "Pop-up window was blocked. Please allow pop-ups for this site."
      );
      setGenerating(false);
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      // printWindow.close();
    }, 500);
  };

  // ./src/app/components/LogCheckQuality/PrintReport/PrintReport.jsx
  const fetchReportData = async () => {
    try {
      setGenerating(true);
      setError(null);

      if (!inspection?.id) {
        throw new Error("Invalid inspection data");
      }

      // ดึงข้อมูลเครื่องจักร
      const machineResponse = await fetch(`/api/public/quality-machine-logs`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      let machineData = {};
      if (machineResponse.ok) {
        const machinesResult = await machineResponse.json();
        const machines = Array.isArray(machinesResult)
          ? machinesResult
          : machinesResult.data || [];
        machineData =
          machines.find((m) => m.id === inspection.machine_id) || {};
      }

      // ดึงข้อมูลรายการตรวจสอบคุณภาพ
      const itemsResponse = await fetch(
        `/api/public/quality-all-items?inspection_id=${inspection.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!itemsResponse.ok) {
        throw new Error(
          `Failed to fetch inspection items: ${itemsResponse.statusText}`
        );
      }

      const itemsResult = await itemsResponse.json();
      const itemsData = itemsResult.data || [];

      if (!itemsData || itemsData.length === 0) {
        // ถ้าไม่มีข้อมูลรายการตรวจสอบ ให้สร้างรายงานที่มีแค่ข้อมูลหลัก
        const reportHTML = PrintReportTemplate({
          inspection,
          inspectionItems: [],
          measurements: [],
          machineInfo: machineData,
          overallResult: inspection.overall_result,
        });

        openPrintWindow(reportHTML);
        return;
      }

      let qualityItemsMap = {};

      try {
        if (inspection.machine_model_id) {
          const qualityItemsResponse = await fetch(
            `/api/public/quality/items?machineModelId=${
              inspection.machine_model_id
            }&barCodeUnit=${inspection.barcode_unit || ""}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (qualityItemsResponse.ok) {
            const qualityItemsResult = await qualityItemsResponse.json();
            const qualityItems = qualityItemsResult.success
              ? qualityItemsResult.data
              : [];

            qualityItemsMap = qualityItems.reduce((map, item) => {
              map[item.id] = item;
              return map;
            }, {});

            /*
            console.log(
              "Quality items map:",
              JSON.stringify(qualityItemsMap, null, 2)
            );
            */
          }
        }
      } catch (error) {
        console.warn("Error fetching model quality items:", error);
      }

      // ดึงข้อมูลการวัดค่าสำหรับแต่ละรายการ
      const measurementsPromises = itemsData.map((item) =>
        fetch(
          `/api/public/quality-all-measurements?inspection_item_id=${item.id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        )
      );

      const measurementsResponses = await Promise.all(measurementsPromises);

      const allMeasurements = [];

      for (let i = 0; i < measurementsResponses.length; i++) {
        if (measurementsResponses[i].ok) {
          const measureResult = await measurementsResponses[i].json();
          const data = measureResult.data || [];

          const qualityItemId = itemsData[i].quality_item_id;
          const qualityItem = qualityItemsMap[qualityItemId] || {};

          const itemName =
            qualityItem.item ||
            qualityItem.name ||
            itemsData[i].item ||
            `Item ${i + 1}`;

          const thaiItemName =
            qualityItem.thaiItem ||
            qualityItem.thai_name ||
            itemsData[i].thaiItem ||
            "";

          allMeasurements.push({
            item: qualityItem.item,
            thaiItem: qualityItem.thaiItem,
            standard_value: itemsData[i].standard_value,
            tolerance: itemsData[i].tolerance,
            unit: itemsData[i].unit,
            measurements: data.map((measurement) => ({
              point_number: measurement.point_number || 1,
              measured_value: measurement.measured_value,
              status: measurement.status || "idle",
              issue_detail: measurement.issue_detail || "",
            })),
          });
        }
      }

      const reportHTML = PrintReportTemplate({
        inspection,
        inspectionItems: itemsData,
        measurements: allMeasurements,
        machineInfo: machineData,
        qualityItemsMap: qualityItemsMap,
        overallResult: inspection.overall_result,
      });

      openPrintWindow(reportHTML);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    fetchReportData();
  };

  return (
    <PrintReportButton
      onClick={handlePrint}
      generating={generating}
      error={error}
    />
  );
};

export default PrintReport;
