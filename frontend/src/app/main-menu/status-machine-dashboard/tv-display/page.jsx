// ./src/app/main-menu/status-machine-dashboard/tv-display/page.jsx

"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import MachineCard from "../../../components/StatusMachineDashboard/ui-components/MachineCard";
import MachineTable from "../../../components/StatusMachineDashboard/ui-components/MachineTable";
import DetailModal from "../../../components/StatusMachineDashboard/ui-components/DetailModal";
import { filterAndSortMachines } from "../../../components/StatusMachineDashboard/utils/helpers";
import {
  fetchMachines,
  generateMockMachines,
  fetchMachineWithHistory,
} from "../../../components/StatusMachineDashboard/utils/apiUtils";

// CSS สำหรับซ่อน Navbar
const hideNavbarStyle = `
  nav, header, footer {
    display: none !important;
  }
  
  body {
    padding-top: 0 !important;
    margin-top: 0 !important;
  }
  
  .container {
    max-width: 100% !important;
    padding: 0.5rem !important;
  }
`;

function StatusMachineDashboardPage() {
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
  const [currentTime, setCurrentTime] = useState(new Date()); // เพิ่มเวลาปัจจุบัน

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
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // อัพเดทข้อมูลทุกนาที
    const dataInterval = setInterval(() => {
      console.log("Auto refreshing machines data...");
      setRefreshTrigger((prev) => prev + 1);
      // อัพเดทเวลาพร้อมกับการรีเฟรชข้อมูล (ทุกนาที แทนที่จะเป็นทุกวินาที)
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearInterval(dataInterval);
    };
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
        setError("ไม่สามารถโหลดข้อมูลเครื่องจักรได้ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  };

  // กรองและจัดเรียงข้อมูลเครื่องจักร
  const sortedMachines = filterAndSortMachines(machines, {
    searchTerm,
    filterStatus,
    selectedDepartment,
    sortBy,
  });

  // เรียงลำดับเครื่องจักรให้เครื่องเสียขึ้นก่อน
  const prioritizedMachines = [...sortedMachines].sort((a, b) => {
    // กำหนดระดับความสำคัญของสถานะ (ตัวเลขน้อยกว่า = สำคัญกว่า)
    const priorityOrder = {
      down: 1, // เครื่องเสีย
      maintenance: 2, // กำลังซ่อมบำรุง
      waiting_leader_approval: 3, // รอ Production Leader Approve
      waiting_for_customer: 4, // รอลูกค้า
      running: 5, // กำลังทำงานปกติ
      idle: 6, // เครื่องว่าง
    };

    // สถานะที่ไม่อยู่ในรายการให้ความสำคัญต่ำสุด
    const priorityA = priorityOrder[a.status] || 999;
    const priorityB = priorityOrder[b.status] || 999;

    // เรียงตามระดับความสำคัญ
    return priorityA - priorityB;
  });

  const formatDateTime = () => {
    // Use HTML to display time with automatic updates without re-rendering the component
    return (
   <div className="text-lg font-semibold">
   <span>
   {new Date().toLocaleDateString("en-US", {
   month: "long",
   day: "numeric",
   year: "numeric",
   })} {/* Space added here */}
   <time dateTime={new Date().toISOString()}>
   {/* Hidden JavaScript to update time directly on the web page */}
   <span className="time-display">
   {new Date().toLocaleTimeString('en-US', {
   hour: '2-digit',
   minute: '2-digit',
   second: '2-digit',
   hour12: false
   })}
   </span>
   <script
   dangerouslySetInnerHTML={{
   __html: `
    function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
    });
    document.querySelector('.time-display').textContent = timeStr;
    }
    // Update every second
    setInterval(updateClock, 1000);
    `,
    }}
   />
   </time>
   </span>
   </div>
    );
   };
   

  return (
    <>
      {/* CSS สำหรับซ่อน Navbar */}
      <style jsx global>
        {hideNavbarStyle}
      </style>

      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto">
          {/* เพิ่มหัวข้อที่มีเวลาแสดงด้วย */}
          <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow">
            <h1 className="text-2xl font-bold">List of Machines</h1>
            {formatDateTime()}
          </div>

          {/* รายการเครื่องจักร - ส่วนนี้ยังคงแสดงอยู่ */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-2">Loading data...</p>
            </div>
          ) : error ? (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          ) : sortedMachines.length === 0 ? (
            <div className="text-center bg-white rounded-lg shadow py-10">
              <div className="mb-4">
                <Search className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <p className="text-gray-500">Machine data not found</p>
            </div>
          ) : currentView === "grid" ? (
            // แสดงแบบกริด
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
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

          {/* โมดัลแสดงรายละเอียด */}
          {showDetailModal && (
            <DetailModal
              machine={selectedMachine}
              downtimeHistory={downtimeHistory}
              onClose={() => setShowDetailModal(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default StatusMachineDashboardPage;
