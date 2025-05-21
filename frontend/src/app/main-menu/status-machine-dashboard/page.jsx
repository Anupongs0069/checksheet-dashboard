// ./src/app/main-menu/status-machine-dashboard/page.jsx

"use client";
import React, { useState, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
import StatusSummaryCard from "../../components/StatusMachineDashboard/ui-components/StatusSummaryCard";
import MachineCard from "../../components/StatusMachineDashboard/ui-components/MachineCard";
import MachineTable from "../../components/StatusMachineDashboard/ui-components/MachineTable";
import StatusDashboardForm from "../../components/StatusMachineDashboard/StatusDashboardForm";
import DetailModal from "../../components/StatusMachineDashboard/ui-components/DetailModal";
import {
  STATUS,
  filterAndSortMachines,
} from "../../components/StatusMachineDashboard/utils/helpers";
import {
  fetchMachines,
  generateMockMachines,
  fetchMachineWithHistory,
  updateMachineStatus,
} from "../../components/StatusMachineDashboard/utils/apiUtils";
import { useDarkMode } from "@/app/components/DarkModeProvider";

function StatusMachineDashboardPage() {
  const { darkMode } = useDarkMode();

  // state ต่างๆใน component
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("machine_name");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [downtimeHistory, setDowntimeHistory] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [timeRange, setTimeRange] = useState("today");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ดึงข้อมูลเครื่องจักร
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลเครื่องจักร
        let machinesData;
        try {
          machinesData = await fetchMachines();
        } catch (error) {
          console.warn("Error fetching real machines, using mock data:", error);
          machinesData = generateMockMachines(30);
        }
        setMachines(machinesData);

        // สร้างรายการแผนก
        const uniqueDepartments = [
          ...new Set(
            machinesData.map((machine) => machine.department).filter(Boolean)
          ),
        ];
        setDepartments(uniqueDepartments);

        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Unable to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(() => {
      console.log("Auto refreshing machines data...");
      setRefreshTrigger((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [refreshTrigger]);

  // ฟังก์ชันเรียกดูรายละเอียดเครื่องจักร
  const handleViewDetails = async (machineId) => {
    try {
      setLoading(true);

      // ดึงข้อมูลเครื่องจักรพร้อมประวัติการหยุดทำงาน
      try {
        const data = await fetchMachineWithHistory(machineId);
        setSelectedMachine(data.machine);
        setDowntimeHistory(data.downtimeHistory);
        setShowDetailModal(true);
      } catch (error) {
        console.error("Error fetching machine details:", error);
        setError("Unable to load data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันอัพเดตสถานะเครื่องจักร
  const handleUpdateMachineStatus = async (machineId, newStatus) => {
    try {
      console.log(`Updating machine ${machineId} status to ${newStatus}`);

      try {
        await updateMachineStatus(machineId, newStatus);
        console.log("API update successful");
      } catch (apiError) {
        console.warn(
          "API update failed, using local state update instead:",
          apiError
        );
      }

      setMachines((prevMachines) =>
        prevMachines.map((machine) =>
          machine.id === machineId ? { ...machine, status: newStatus } : machine
        )
      );

      if (selectedMachine && selectedMachine.id === machineId) {
        setSelectedMachine((prevMachine) => ({
          ...prevMachine,
          status: newStatus,
        }));
      }

      console.log(
        `Machine ${machineId} status updated to ${newStatus} in local state`
      );

      return true;
    } catch (error) {
      console.error("Error updating machine status:", error);
      setError("Unable to update machinery status. Please try again.");
      return false;
    }
  };

  // คำนวณสรุปสถานะเครื่องจักร
  const statusSummary = machines.reduce((acc, machine) => {
    acc[machine.status] = (acc[machine.status] || 0) + 1;
    return acc;
  }, {});

  // กรองและจัดเรียงข้อมูลเครื่องจักร
  const sortedMachines = filterAndSortMachines(machines, {
    searchTerm,
    filterStatus,
    selectedDepartment,
    sortBy,
  });

  const prioritizedMachines = [...sortedMachines].sort((a, b) => {
    const priorityOrder = {
      down: 1,
      maintenance: 2,
      waiting_leader_approval: 3,
      waiting_for_customer: 4,
      running: 5,
      idle: 6,
    };

    const priorityA = priorityOrder[a.status] || 999;
    const priorityB = priorityOrder[b.status] || 999;

    return priorityA - priorityB;
  });

  // ฟังก์ชันรีเฟรชข้อมูล
  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div
      className={`container mx-auto p-4 ${
        darkMode ? "bg-gray-900 text-white" : ""
      }`}
    >
      <h1 className="text-2xl font-bold mb-6">List of Machinery</h1>

      {/* แบบฟอร์มค้นหาและตัวกรอง */}
      <StatusDashboardForm
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        departments={departments}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        currentView={currentView}
        setCurrentView={setCurrentView}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        refreshData={refreshData}
      />

      {/* List of Machinery */}
      {loading ? (
        <div
          className={`flex justify-center items-center h-64 ${
            darkMode ? "text-white" : ""
          }`}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-2">Loading data...</p>
        </div>
      ) : error ? (
        <div
          className={`${
            darkMode
              ? "bg-red-900 border-red-800 text-red-200"
              : "bg-red-100 border-red-400 text-red-700"
          } border px-4 py-3 rounded relative`}
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      ) : prioritizedMachines.length === 0 ? (
        <div
          className={`text-center ${
            darkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg shadow py-10`}
        >
          <div className="mb-4">
            <Search
              className={`h-12 w-12 mx-auto ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
          </div>
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
            No machinery data found matching the criteria.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("all");
              setSelectedDepartment("all");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : currentView === "grid" ? (
        // แสดงแบบกริด
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {prioritizedMachines.map((machine) => (
            <MachineCard
              key={machine.id}
              machine={machine}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        // แสดงแบบลิสต์
        <MachineTable
          machines={prioritizedMachines}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* สรุปจำนวนเครื่องจักรตามสถานะ */}
      <div
        className={`mt-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } p-4 rounded-lg shadow`}
      >
        <h2 className="text-lg font-semibold mb-2">
          Machinery Status Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* การ์ดแสดงจำนวนรวม */}
          <StatusSummaryCard
            key="total"
            status="total"
            count={machines.length}
            total={machines.length}
            label="Total Machines"
            icon={<RefreshCw className="h-5 w-5 text-gray-500" />}
            colorClass={
              darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
            }
          />

          {/* การ์ดสถานะอื่นๆ */}
          {Object.values(STATUS).map((status) => (
            <StatusSummaryCard
              key={status}
              status={status}
              count={statusSummary[status] || 0}
              total={machines.length}
            />
          ))}
        </div>
      </div>

      {/* โมดัลแสดงรายละเอียด */}
      {showDetailModal && (
        <DetailModal
          machine={selectedMachine}
          downtimeHistory={downtimeHistory}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={handleUpdateMachineStatus}
        />
      )}
    </div>
  );
}

export default StatusMachineDashboardPage;
