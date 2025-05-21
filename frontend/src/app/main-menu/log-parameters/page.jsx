// .src/app/main-menu/log-parameters/page.jsx

"use client";
import React, { useState, useEffect } from "react";
import { ClipboardCheck, Clock } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

import { useDarkMode } from "@/app/components/DarkModeProvider";
import { formatDate } from "@/app/components/DateFormatter";

import LogParametersForm from "../../components/LogParameters/LogParametersForm";
import LogParametersTable from "../../components/LogParameters/LogParametersTable";
import LogParametersStats from "../../components/LogParameters/LogParametersStats";

const LogParametersPage = () => {
  const { } = useAuth();
  const { darkMode } = useDarkMode();
  const [error, setError] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchInspections();
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

      // Fetch parameter inspections with machine details
      const response = await fetch("/api/public/parameter-inspections", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);


      if (!response.ok) {
        throw new Error("Failed to fetch parameter inspections");
      }

      const data = await response.json();
    //  console.log("Parameter inspections data:", data);

      if (!Array.isArray(data)) {
        console.error("Received non-array data:", data);
        throw new Error("Invalid data format received");
      }

      const formattedData = data.map((item) => {
        return {
          id: item?.id || "",
          machine_id: item?.machine_id || "",
          machine_name: item?.machine_name || "",
          machine_number: item?.machine_number || "",
          model: item?.model || "",
          customer: item?.customer || "",
          product: item?.product || "",
          program_name: item?.program_name || "",
          work_order: item?.work_order || "",
          checked_at: item?.checked_at || new Date().toISOString(),
          shift: item?.shift || "",
          status: item?.status || "",
          checked_by: item?.checked_by || "",
        };
      });

      setInspections(formattedData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayData = formattedData.filter((inspection) => {
        const checkDate = new Date(inspection.checked_at);
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
      ...new Set(inspections.map((m) => m.customer)),
    ].filter(Boolean);
    return [...allCustomers, ...uniqueCustomers.sort()];
  };

  const getProducts = () => {
    const allProducts = ["all"];
    const uniqueProducts = [...new Set(inspections.map((m) => m.product))].filter(
      Boolean
    );
    return [...allProducts, ...uniqueProducts.sort()];
  };

  const filterInspections = (filters) => {
    const {
      searchTermName,
      searchTermNumber,
      startDate,
      endDate,
      selectedCustomer,
      selectedProduct
    } = filters;

    const filtered = inspections.filter((inspection) => {
      const matchesMachineName =
        !searchTermName ||
        inspection.machine_name
          .toLowerCase()
          .includes(searchTermName.toLowerCase());

      const matchesMachineNumber =
        !searchTermNumber ||
        inspection.machine_number
          .toLowerCase()
          .includes(searchTermNumber.toLowerCase());

      const matchesCustomer =
        selectedCustomer === "all" || inspection.customer === selectedCustomer;

      const matchesProduct =
        selectedProduct === "all" || inspection.product === selectedProduct;

      let isInDateRange = true;
      if (startDate || endDate) {
        const checkDate = new Date(inspection.checked_at);
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
        "Program",
        "Work Order",
        "Check Date",
        "Shift",
        "Status",
        "Checked By",
      ],
      ...filteredResults.map((inspection) => [
        inspection.machine_name,
        inspection.machine_number,
        inspection.model,
        inspection.customer,
        inspection.product,
        inspection.program_name,
        inspection.work_order,
        formatDisplayDate(inspection.checked_at),
        inspection.shift,
        inspection.status,
        inspection.checked_by,
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
      `parameter_inspection_log_${new Date().toISOString().split("T")[0]}.csv`
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
              Check Parameters Log
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <Clock className="w-6 h-6" />
            <span>{formatDate(new Date())}</span>
          </div>
        </div>

        <div className={cardClass}>
          <LogParametersStats
            darkMode={darkMode}
            filteredResults={filteredResults}
          />

          <LogParametersForm
            darkMode={darkMode}
            getCustomers={getCustomers}
            getProducts={getProducts}
            onSearch={filterInspections}
            onExport={handleExportCSV}
          />

          {error && (
            <div className="p-4 mb-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
              <p>Error: {error}</p>
            </div>
          )}

          <LogParametersTable
            darkMode={darkMode}
            filteredResults={filteredResults}
            isSearching={isSearching}
          />
        </div>
      </div>
    </div>
  );
};

export default LogParametersPage;