// ./src/app/main-menu/log-quality/page.jsx

"use client";
import React, { useState, useEffect } from "react";
import { ClipboardCheck, Clock } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

import { useDarkMode } from "@/app/components/DarkModeProvider";

import { formatDate } from "@/app/components/DateFormatter";
import LogCheckQualityForm from "@/app/components/LogCheckQuality/LogCheckQualityForm";
import LogCheckQualityTable from "@/app/components/LogCheckQuality/LogCheckQualityTable";
import LogCheckQualityStats from "@/app/components/LogCheckQuality/LogCheckQualityStats";

const LogQualityPage = () => {
  const { } = useAuth();
  const { darkMode } = useDarkMode();
  const [error, setError] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [machines, setMachines] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // เพิ่มการป้องกันข้อมูลที่ได้จาก API
        await fetchInspections();
        await fetchMachines();
        await fetchModels();
      } catch (err) {
        if (err.response) {
          setError(
            `Server Error: ${err.response.data.message || "Something went wrong"}`
          );
        } else if (err.request) {
          setError("Cannot connect to server. Please check your connection.");
        } else {
          setError("Failed to load inspection data. Please try again later.");
        }
        setLoading(false);
      }
    };
  
    loadData();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/public/quality-inspections", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch inspections");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("Received non-array data:", data);
        throw new Error("Invalid data format received");
      }

      setInspections(data);

      // Filter for today's inspections by default
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayData = data.filter((inspection) => {
        const inspectionDate = new Date(inspection.inspection_date);
        inspectionDate.setHours(0, 0, 0, 0);
        return inspectionDate.getTime() === today.getTime();
      });

      setFilteredResults(todayData);
      setIsSearching(true);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
      setFilteredResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await fetch("/api/public/quality-machine-logs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch machines");
      }

      const data = await response.json();
      setMachines(data);
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  };

// แก้ไขฟังก์ชัน fetchModels
const fetchModels = async () => {
  try {
    const response = await fetch("/api/public/quality-machine-models-logs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch machine models");
    }

    const data = await response.json();
    const modelsWithNames = data.map(model => ({
      ...model,
      model_name: model.machine_name || model.model || `Model ${model.id}`
    }));
    setModels(modelsWithNames);
  } catch (error) {
    console.error("Error fetching machine models:", error);
  }
};

  const getWorkOrders = () => {
    const allWorkOrders = ["all"];
    const uniqueWorkOrders = [
      ...new Set(inspections.map((i) => i.work_order)),
    ].filter(Boolean);
    return [...allWorkOrders, ...uniqueWorkOrders.sort()];
  };

  const getMachineNames = () => {
    const allMachines = ["all"];
    const uniqueMachineIds = [
      ...new Set(inspections.map((i) => i.machine_id)),
    ].filter(Boolean);
    
    const machineNames = uniqueMachineIds.map(id => {
      const machine = machines.find(m => m.id === id);
      return machine ? machine.machine_name : `Machine ${id}`;
    });
    
    return [...allMachines, ...machineNames.sort()];
  };

  const filterInspections = (filters) => {
    const {
      searchTermMachine,
      searchTermWorkOrder,
      startDate,
      endDate,
      selectedEmployee,
      selectedResult
    } = filters;

    const filtered = inspections.filter((inspection) => {
      // Find machine name for this inspection
      const machine = machines.find(m => m.id === inspection.machine_id);
      const machineName = machine ? machine.machine_name : "";
      
      const matchesMachineName =
        !searchTermMachine ||
        machineName
          .toLowerCase()
          .includes(searchTermMachine.toLowerCase());

      const matchesWorkOrder =
        !searchTermWorkOrder ||
        inspection.work_order
          .toLowerCase()
          .includes(searchTermWorkOrder.toLowerCase());

      const matchesEmployee =
        selectedEmployee === "all" || 
        inspection.employee_id === selectedEmployee || 
        inspection.lead_employee_id === selectedEmployee;

      const matchesResult =
        selectedResult === "all" || 
        inspection.overall_result.toLowerCase() === selectedResult.toLowerCase();

      let isInDateRange = true;
      if (startDate || endDate) {
        const inspectionDate = new Date(inspection.inspection_date);
        inspectionDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          isInDateRange = isInDateRange && inspectionDate >= start;
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          isInDateRange = isInDateRange && inspectionDate <= end;
        }
      }

      return (
        matchesMachineName &&
        matchesWorkOrder &&
        matchesEmployee &&
        matchesResult &&
        isInDateRange
      );
    });

    setFilteredResults(filtered);
    setIsSearching(true);
  };

  const handleExportCSV = () => {
    const BOM = "\uFEFF";

    const formatDisplayDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const csvData = [
      [
        "Machine Name",
        "Machine Model",
        "Work Order",
        "Barcode Unit",
        "Inspection Date",
        "Shift",
        "Result",
        "Employee ID",
        "Lead Employee ID",
        "Remarks"
      ],
      ...filteredResults.map((inspection) => {
        const machine = machines.find(m => m.id === inspection.machine_id) || {};
        const model = models.find(m => m.id === inspection.machine_model_id) || {};
        
        return [
          machine.machine_name || `Machine ${inspection.machine_id}`,
          model.model_name || model.machine_name || model.model || `Model ${inspection.machine_model_id}`,
          inspection.work_order,
          inspection.barcode_unit,
          formatDisplayDate(inspection.inspection_date),
          inspection.shift,
          inspection.overall_result.toUpperCase(),
          inspection.employee_id,
          inspection.lead_employee_id,
          inspection.remarks || ""
        ];
      }),
    ];

    const csvContent =
      BOM +
      csvData
        .map((row) =>
          row
            .map((cell) =>
              typeof cell === "string" &&
                (cell.includes(",") || cell.includes('"'))
                ? `"${cell.replace(/"/g, '""')}"`
                : cell
            )
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `quality_inspections_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const cardClass = `p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
    }`;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} p-8`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <ClipboardCheck
              className={`w-8 h-8 ${darkMode ? "text-blue-400" : "text-blue-500"
                }`}
            />
            <h2
              className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"
                }`}
            >
              Quality Inspection Log
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <Clock className="w-6 h-6" />
            <span>{formatDate(new Date())}</span>
          </div>
        </div>

        <div className={cardClass}>
          <LogCheckQualityStats
            darkMode={darkMode}
            filteredResults={filteredResults}
          />

          <LogCheckQualityForm
            darkMode={darkMode}
            getWorkOrders={getWorkOrders}
            getMachineNames={getMachineNames}
            onSearch={filterInspections}
            onExport={handleExportCSV}
          />

          {error && (
            <div className="p-4 mb-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
              <p>Error: {error}</p>
            </div>
          )}

          <LogCheckQualityTable
            darkMode={darkMode}
            filteredResults={filteredResults}
            isSearching={isSearching}
            machines={machines}
            models={models}
          />
        </div>
      </div>
    </div>
  );
};

export default LogQualityPage;