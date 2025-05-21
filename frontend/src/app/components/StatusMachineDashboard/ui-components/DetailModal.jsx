// ./src/app/components/StatusMachineDashboard/ui-components/DetailModal.jsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StatusIndicator from "./StatusIndicator";
import { formatDateTime } from "../utils/helpers";
import { useDarkMode } from "@/app/components/DarkModeProvider";
import { useAuth } from "@/contexts/AuthContext";
import Swal from "sweetalert2";
import {
  AlertTriangle,
  Wrench,
  FileText,
  User,
  ClipboardCheck,
  MessageSquare,
  Info,
  Clock,
  Database,
  Monitor,
  Hash,
} from "lucide-react";
import { fetchMachineLatestInfo } from "../utils/apiUtils";

const DetailModal = ({ machine, onClose, onUpdateStatus }) => {
  const { darkMode } = useDarkMode();
  const { isLoggedIn, user, resetLogoutTimer } = useAuth();
  const [loading, setLoading] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState(null);
  const router = useRouter();

  const allowedRoles = [2, 4, 5, 6];
  const canApprove =
    isLoggedIn && user?.role && allowedRoles.includes(user.role);

  // ย้าย useEffect มาก่อนเงื่อนไข if check
  useEffect(() => {
    if (machine) {
      const machineData = machine.data || machine;
      if (machineData && (machineData.id || machineData.machine_id)) {
        const machineId = machineData.id || machineData.machine_id;
        const fetchAdditionalData = async () => {
          try {
            setLoading(true);
            const result = await fetchMachineLatestInfo(machineId);
            if (result && result.data) {
              setAdditionalInfo(result.data);
            }
          } catch (error) {
            console.error("Failed to fetch additional machine info:", error);
          } finally {
            setLoading(false);
          }
        };

        fetchAdditionalData();
      }
    }
  }, [machine]);

  // Early return หลังจากประกาศ hooks ทั้งหมด
  if (!machine) return null;

  const machineData = machine.data || machine;

  // รวมข้อมูลทั้งหมด
  const combinedData = {
    ...machineData,
    ...additionalInfo,
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      resetLogoutTimer();
      setLoading(true);

      const machineId = machineData.machine_id;

      if (!machineId) {
        console.error("Machine ID is undefined or null");
        alert("Cannot update status: Machine ID is missing");
        return;
      }

      const getStatusName = (status) => {
        switch (status) {
          case "running":
            return "Operating Normally";
          case "waiting_for_customer":
            return "Waiting for Customer";
          case "waiting_leader_approval":
            return "Waiting for Leader Approval";
          case "active":
          case "down":
            return "Machine Breakdown";
          case "idle":
            return "Not in Use";
          case "maintenance":
            return "Under Maintenance";
          default:
            return status;
        }
      };

      const currentStatus = getStatusName(machineData.status || "running");
      const newStatusName = getStatusName(newStatus);

      if (onUpdateStatus) {
        await onUpdateStatus(machineId, newStatus);

        await Swal.fire({
          title: "Updating Status...",
          text: `We're changing from: ${currentStatus} to: ${newStatusName}`,
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        onClose();
      } else {
        console.warn("onUpdateStatus function is not provided");

        await Swal.fire({
          title: "Notification",
          text: `The status will be changed from ${currentStatus} to ${newStatusName}`,
          icon: "info",
          timer: 1000,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        onClose();
      }
    } catch (error) {
      console.error("Error updating status:", error);

      await Swal.fire({
        title: "Something Went Wrong",
        text: `We couldn't change the status: ${error.message}`,
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnForEdits = () => {
    if (machineData.id || machineData.machine_id || machineData.downtime_id) {
      const id =
        machineData.id || machineData.machine_id || machineData.downtime_id;
      router.push(`/main-menu/machine-downtime/machinedown-returnedits/${id}`);
      onClose();
    } else {
      Swal.fire({
        title: "Error",
        text: "Cannot find machine or downtime ID",
        icon: "error",
      });
    }
  };

  const renderStatusSource = () => {
    if (!machineData.status_source) return null;

    let sourceText;
    switch (machineData.status_source) {
      case "downtime":
        sourceText = "บันทึกการหยุดทำงาน";
        break;
      case "safety":
        sourceText = "ตรวจสอบความปลอดภัย";
        break;
      case "manual":
        sourceText = "ปรับด้วยตนเอง";
        break;
      case "system":
        sourceText = "ระบบ";
        break;
      default:
        sourceText = machineData.status_source;
    }

    return (
      <div className="hidden">
        <span className={`${darkMode ? "text-gray-300" : "text-gray-500"}`}>
          สถานะจาก:
        </span>
        <span>{sourceText}</span>
      </div>
    );
  };

  // ในส่วนของ renderProblemDetails ให้แก้ไขดังนี้

  const renderProblemDetails = () => {
    const isActive =
      combinedData.status === "active" || combinedData.status === "down";

    if (
      !isActive &&
      combinedData.status !== "maintenance" &&
      combinedData.status !== "waiting_leader_approval"
    ) {
      return null;
    }

    // สร้างตัวแปรสำหรับเก็บข้อมูลที่ต้องการแสดง
    const problemType = combinedData.problem_type || "-";
    const workOrder = combinedData.work_order || "-";
    const problemDescription = combinedData.problem_description || "-";
    const technicianId = combinedData.technician_id || "-";
    const reportedBy = combinedData.reported_by || "-";
    const solutionDescription = combinedData.solution_description || "-";

    const infoClass = `p-3 rounded-lg ${
      darkMode ? "bg-gray-600" : "bg-gray-50"
    } mt-1`;
    const labelClass = `block ${
      darkMode ? "text-gray-300" : "text-gray-600"
    } text-sm`;

    return (
      <div
        className={`mb-6 p-4 rounded-lg ${
          darkMode ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <AlertTriangle
            className={`mr-2 ${darkMode ? "text-amber-400" : "text-amber-500"}`}
            size={20}
          />
          Problem Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
          {/* Problem Type */}
          <div>
            <span className={labelClass}>
              <span className="flex items-center">
                <FileText
                  className={`mr-2 ${
                    darkMode ? "text-blue-400" : "text-blue-500"
                  }`}
                  size={16}
                />
                Problem Type
              </span>
            </span>
            <div className={infoClass}>{problemType}</div>
          </div>

          {/* Work Order */}
          <div>
            <span className={labelClass}>
              <span className="flex items-center">
                <ClipboardCheck
                  className={`mr-2 ${
                    darkMode ? "text-green-400" : "text-green-500"
                  }`}
                  size={16}
                />
                Work Order
              </span>
            </span>
            <div className={infoClass}>{workOrder}</div>
          </div>

          {/* Problem Description - Full width */}
          <div className="col-span-1 md:col-span-2">
            <span className={labelClass}>
              <span className="flex items-center">
                <MessageSquare
                  className={`mr-2 ${
                    darkMode ? "text-purple-400" : "text-purple-500"
                  }`}
                  size={16}
                />
                Problem Description
              </span>
            </span>
            <div className={infoClass}>{problemDescription}</div>
          </div>

          {/* Technician ID (แสดงเฉพาะสถานะ maintenance และ waiting_leader_approval) */}
          {(combinedData.status === "maintenance" ||
            combinedData.status === "waiting_leader_approval") && (
            <div>
              <span className={labelClass}>
                <span className="flex items-center">
                  <User
                    className={`mr-2 ${
                      darkMode ? "text-cyan-400" : "text-cyan-500"
                    }`}
                    size={16}
                  />
                  Technician Accept Job
                </span>
              </span>
              <div className={infoClass}>{technicianId}</div>
            </div>
          )}

          {/* Reported By (แสดงเฉพาะสถานะ waiting_leader_approval) - แก้ไขจาก Resolved Technician ID */}
          {combinedData.status === "waiting_leader_approval" && (
            <div>
              <span className={labelClass}>
                <span className="flex items-center">
                  <User
                    className={`mr-2 ${
                      darkMode ? "text-green-400" : "text-green-500"
                    }`}
                    size={16}
                  />
                  Technician Resolved
                </span>
              </span>
              <div className={infoClass}>{reportedBy}</div>
            </div>
          )}

          {/* Solution Description (แสดงเฉพาะสถานะ waiting_leader_approval) - แก้ไขจาก Action Description */}
          {combinedData.status === "waiting_leader_approval" && (
            <div className="col-span-1 md:col-span-2">
              <span className={labelClass}>
                <span className="flex items-center">
                  <Wrench
                    className={`mr-2 ${
                      darkMode ? "text-orange-400" : "text-orange-500"
                    }`}
                    size={16}
                  />
                  Action Description
                </span>
              </span>
              <div className={infoClass}>{solutionDescription}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white"
        } rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl`}
      >
        {/* Modal Header */}
        <div
          className={`p-6 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center">
              <Info
                className={`mr-2 ${
                  darkMode ? "text-blue-400" : "text-blue-500"
                }`}
                size={24}
              />
              Machinery Details
            </h2>
            <button
              onClick={onClose}
              className={`${
                darkMode
                  ? "text-gray-300 hover:text-gray-100"
                  : "text-gray-500 hover:text-gray-700"
              } transition-colors`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* แสดง Loading indicator เมื่อกำลังโหลดข้อมูล */}
          {loading && (
            <div className="text-center py-4">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Loading additional information...
              </p>
            </div>
          )}

          {/* Status Section - Highlight the status */}
          <div
            className={`mb-6 p-4 rounded-lg ${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Database
                  className={`mr-2 ${
                    darkMode ? "text-indigo-400" : "text-indigo-500"
                  }`}
                  size={20}
                />
                Current Status
              </h3>
              <StatusIndicator status={combinedData.status || "running"} />
            </div>

            {combinedData.status_updated_at && (
              <div className="mt-2 text-sm flex items-center">
                <Clock
                  className={`mr-2 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                  size={16}
                />
                <span
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Last Updated:
                </span>
                <span className="ml-2 font-medium">
                  {formatDateTime(combinedData.status_updated_at)}
                </span>
              </div>
            )}
          </div>

          {/* Machine Info Section */}
          <div
            className={`mb-6 p-4 rounded-lg ${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Monitor
                className={`mr-2 ${
                  darkMode ? "text-cyan-400" : "text-cyan-500"
                }`}
                size={20}
              />
              Machine Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <span
                  className={`block ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  } text-sm flex items-center`}
                >
                  <Wrench className="h-4 w-4 mr-1" />
                  Machinery Name
                </span>
                <span className="block font-medium mt-1">
                  {combinedData.machine_name ||
                    combinedData.machine_full_name ||
                    "-"}
                </span>
              </div>

              <div>
                <span
                  className={`block ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  } text-sm flex items-center`}
                >
                  <Hash className="h-4 w-4 mr-1" />
                  Machinery Number
                </span>
                <span className="block font-medium mt-1">
                  {combinedData.machine_number || "-"}
                </span>
              </div>

              {/* Hide Model field */}
              {combinedData.model && false && (
                <div>
                  <span
                    className={`block ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } text-sm`}
                  >
                    Model
                  </span>
                  <span className="block font-medium mt-1">
                    {combinedData.model}
                  </span>
                </div>
              )}

              {/* Hidden status source stays hidden */}
              {renderStatusSource()}
            </div>
          </div>

          {/* Problem Details Section - Added based on requirements */}
          {renderProblemDetails()}

          {/* Action Buttons Section */}
          <div
            className={`flex justify-end gap-3 pt-4 border-t ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {/* ปุ่มกลับสู่สถานะปกติ (ซ่อนไว้) */}
            {combinedData.status !== "running" &&
              combinedData.status !== "waiting_for_customer" &&
              combinedData.status !== "waiting_leader_approval" && (
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hidden"
                  onClick={() => handleUpdateStatus("running")}
                  disabled={loading}
                >
                  {loading ? "In progress..." : "Return to normal status"}
                </button>
              )}

            {/* ปุ่มแจ้งซ่อม (ซ่อนไว้) */}
            {combinedData.status === "running" && (
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed hidden"
                onClick={() => handleUpdateStatus("active")}
                disabled={loading}
              >
                {loading ? "In progress..." : "Report machinery issue"}
              </button>
            )}

            {/* ปุ่มแจ้งซ่อม (ซ่อนไว้) */}
            {(combinedData.status === "active" ||
              combinedData.status === "idle") && (
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed hidden"
                onClick={() => handleUpdateStatus("maintenance")}
                disabled={loading}
              >
                {loading ? "In progress..." : "Request maintenance"}
              </button>
            )}

            {/* ปุ่ม Waiting For Customer */}
            {(combinedData.status === "running" ||
              combinedData.status === "idle") &&
              combinedData.status !== "waiting_for_customer" && (
                <button
                  className="px-5 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  onClick={() => handleUpdateStatus("waiting_for_customer")}
                  disabled={loading}
                >
                  {loading ? "In progress..." : "Waiting For Customer"}
                </button>
              )}

            {/* ปุ่มยกเลิก Waiting For Customer */}
            {combinedData.status === "waiting_for_customer" && (
              <button
                className="px-5 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                onClick={() =>
                  handleUpdateStatus(combinedData.previous_status || "running")
                }
                disabled={loading}
              >
                {loading ? "In progress..." : "Cancel Waiting For Customer"}
              </button>
            )}

            {/* ปุ่ม Return for Edits - แสดงเมื่อสถานะเป็น waiting_leader_approval และเป็น leader */}
            {combinedData.status === "waiting_leader_approval" &&
              canApprove && (
                <button
                  className="px-5 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  onClick={handleReturnForEdits}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Return for Edits"}
                </button>
              )}

            {/* ปุ่ม Leader Approval - ยังคงเดิม */}
            {combinedData.status === "waiting_leader_approval" &&
              canApprove && (
                <button
                  className="px-5 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  onClick={() => handleUpdateStatus("running")}
                  disabled={loading}
                >
                  {loading ? "In progress..." : "Approve"}
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
