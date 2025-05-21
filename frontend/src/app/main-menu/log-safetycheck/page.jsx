// src/app/main-menu/log-safetycheck/page.jsx

"use client";
import React, { useState, useEffect } from "react";
import { ClipboardCheck, Clock } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useDarkMode } from "../../components/DarkModeProvider";
import { formatDate } from "../../components/LogSafetyCheck/DateSafetyFormatter";
import LogSafetyCheckForm from "../../components/LogSafetyCheck/LogSafetyCheckForm";
import LogSafetyCheckTable from "../../components/LogSafetyCheck/LogSafetyCheckTable";
import LogSafetyCheckStats from "../../components/LogSafetyCheck/LogSafetyCheckStats";

const LogSafetyCheck = () => {
  const { } = useAuth(); 
  const { darkMode } = useDarkMode();
  const [error, setError] = useState(null);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchMachines();
      } catch (err) {
        if (err.response) {
          setError(
            `Server Error: ${err.response.data.message || "Something went wrong"}`
          );
        } else if (err.request) {
          setError("Cannot connect to server. Please check your connection.");
        } else {
          setError("Failed to load machine data. Please try again later.");
        }
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/public/safety-logs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch machines");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("Received non-array data:", data);
        throw new Error("Invalid data format received");
      }

      const formattedData = data.map((item) => {
        const date = new Date(item?.last_check || new Date().toISOString());
        const hours = date.getHours();
        const shift = hours >= 6 && hours < 18 ? "D" : "N";

        return {
          id: item?.id || "",
          machine_name: item?.machine_name || "",
          machine_number: item?.machine_number || "",
          model: item?.model || "",
          customer: item?.customer || "",
          product: item?.product || "",
          last_check: item?.last_check || new Date().toISOString(),
          shift: shift,
          status: item?.status || "",
          checked_by: item?.checked_by || "",
        };
      });

      setMachines(formattedData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayData = formattedData.filter((machine) => {
        const checkDate = new Date(machine.last_check);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate.getTime() === today.getTime();
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

  const getCustomers = () => {
    const allCustomers = ["all"];
    const uniqueCustomers = [
      ...new Set(machines.map((m) => m.customer)),
    ].filter(Boolean);
    return [...allCustomers, ...uniqueCustomers.sort()];
  };

  const getProducts = () => {
    const allProducts = ["all"];
    const uniqueProducts = [...new Set(machines.map((m) => m.product))].filter(
      Boolean
    );
    return [...allProducts, ...uniqueProducts.sort()];
  };

  const filterMachines = (filters) => {
    const {
      searchTermName,
      searchTermNumber,
      startDate,
      endDate,
      selectedCustomer,
      selectedProduct
    } = filters;

    const filtered = machines.filter((machine) => {
      const matchesMachineName =
        !searchTermName ||
        machine.machine_name
          .toLowerCase()
          .includes(searchTermName.toLowerCase());

      const matchesMachineNumber =
        !searchTermNumber ||
        machine.machine_number
          .toLowerCase()
          .includes(searchTermNumber.toLowerCase());

      const matchesCustomer =
        selectedCustomer === "all" || machine.customer === selectedCustomer;

      const matchesProduct =
        selectedProduct === "all" || machine.product === selectedProduct;

      let isInDateRange = true;
      if (startDate || endDate) {
        const checkDate = new Date(machine.last_check);
        checkDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          isInDateRange = isInDateRange && checkDate >= start;
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          isInDateRange = isInDateRange && checkDate <= end;
        }
      }

      return (
        matchesMachineName &&
        matchesMachineNumber &&
        matchesCustomer &&
        matchesProduct &&
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
        "Machine Number",
        "Model",
        "Customer",
        "Product",
        "Check Date",
        "Shift",
        "Status",
        "Checked By",
      ],
      ...filteredResults.map((machine) => [
        machine.machine_name,
        machine.machine_number,
        machine.model,
        machine.customer,
        machine.product,
        formatDisplayDate(machine.last_check),
        machine.shift,
        machine.status,
        machine.checked_by,
      ]),
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
      `machine_inspection_log_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const cardClass = `p-6 rounded-lg shadow-md ${
    darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
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
              className={`w-8 h-8 ${
                darkMode ? "text-blue-400" : "text-blue-500"
              }`}
            />
            <h2
              className={`text-3xl font-extrabold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Daily Safety Inspection Log
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <Clock className="w-6 h-6" />
            <span>{formatDate(new Date())}</span>
          </div>
        </div>

        <div className={cardClass}>
          <LogSafetyCheckStats 
            darkMode={darkMode} 
            filteredResults={filteredResults} 
          />

          <LogSafetyCheckForm
            darkMode={darkMode}
            getCustomers={getCustomers}
            getProducts={getProducts}
            onSearch={filterMachines}
            onExport={handleExportCSV}
          />

          {error && (
            <div className="p-4 mb-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
              <p>Error: {error}</p>
            </div>
          )}

          <LogSafetyCheckTable 
            darkMode={darkMode} 
            filteredResults={filteredResults} 
            isSearching={isSearching} 
          />
        </div>
      </div>
    </div>
  );
};

export default LogSafetyCheck;