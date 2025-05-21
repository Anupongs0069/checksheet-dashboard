// ./src/app/main-menu/machine-downtime/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDarkMode } from "@/app/components/DarkModeProvider";
import QrScanner from "@/app/components/QrScanner";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { formatDate } from "@/app/components/DateFormatter";
import Swal from "sweetalert2";

// Import components and utilities
import DownTimeDisplay from "@/app/components/DownTime/DownTimeDisplay";
import DownTimeList from "@/app/components/DownTime/DownTimeList";
import {
  findMachineData,
  findModelId,
  fetchReasons,
  submitDowntimeReport,
} from "@/app/components/DownTime/utils/apiUtils";
import { validateFormData } from "@/app/components/DownTime/utils/validationUtils";
import { getCurrentShift,
  getShiftInfo
 } from "@/app/components/DownTime/utils/shiftUtils";

function MachineDownTimePage() {
  const { user, getAuthHeader } = useAuth();
  const { darkMode } = useDarkMode();

  // Machine information states
  const [machineId, setMachineId] = useState(null);
  const [machineName, setMachineName] = useState("");
  const [machineNumber, setMachineNumber] = useState("");
  const [machineModel, setMachineModel] = useState("");
  const [machineModelId, setMachineModelId] = useState(null);
  const [machineCustomer, setMachineCustomer] = useState("");
  const [machineSeriesnumber, setMachineSeriesnumber] = useState("");
  const [machineProduct, setMachineProduct] = useState("");

  // Problem information states
  const [problemType, setProblemType] = useState("");
  const [problemDetail, setProblemDetail] = useState("");
  const [priority, setPriority] = useState("medium");
  const [workOrder, setWorkOrder] = useState("");
  const [shift, setShift] = useState(getShiftInfo().shift);
  const [employeeId, setEmployeeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [reasonList, setReasonList] = useState([]);
  const [selectedReason, setSelectedReason] = useState("");

  // Problem types
  const problemTypes = [
    { value: "Model Change Setup", label: "การเซ็ตอัปเพื่อเปลี่ยนรุ่นงาน" },
    { value: "Preventive Maintenance", label: "การบำรุงรักษาเชิงป้องกัน (PM)" },
    { value: "Unplanned Downtime", label: "การหยุดเครื่องโดยไม่คาดคิด" },
    { value: "Breakdown", label: "เครื่องจักรขัดข้อง" },
    { value: "Quality Check", label: "การตรวจสอบคุณภาพ" },
    { value: "Power Failure", label: "ไฟฟ้าขัดข้อง" },
    { value: "Other", label: "อื่นๆ" },
  ];
  
  // Styling classes
  const cardClass = `p-6 rounded-lg shadow-md ${
    darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
  }`;

  const buttonClass = `px-4 py-2 rounded-md text-white ${
    darkMode
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-blue-600 hover:bg-blue-700"
  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`;

  const disabledButtonClass = `px-4 py-2 rounded-md text-gray-400 ${
    darkMode
      ? "bg-gray-700 cursor-not-allowed"
      : "bg-gray-200 cursor-not-allowed"
  }`;

  // Fetch reasons from API on component load
  useEffect(() => {
    const loadReasons = async () => {
      const reasons = await fetchReasons(getAuthHeader);
      setReasonList(reasons);
    };
    loadReasons();
  }, [getAuthHeader]);

  // Handle QR code scanning
  const handleQrCodeScanned = async (scannedData) => {
    try {
      console.log("Raw QR Data:", scannedData);
      const pattern =
        /Machine_Name: \[(.*?)\] ,Machine_Number: \[(.*?)\] ,Model: \[(.*?)\]/i;
      const matches = scannedData.match(pattern);
      console.log("Pattern Matches:", matches);

      if (matches && matches.length === 4) {
        const [_, name, number, model] = matches;
        console.log("Extracted Data:", { name, number, model });

        try {
          // 1. Find machine data
          const machineData = await findMachineData(name, number, model);
          console.log("Machine Data:", machineData);

          // 2. Get machine model ID
          const modelIdData = await findModelId(name, model);
          console.log("Model ID Data:", modelIdData);

          if (machineData && modelIdData?.machine_model_id) {
            // Set machine basic information
            setMachineId(Number(machineData.id));
            setMachineName(name);
            setMachineNumber(number);
            setMachineModel(model);
            setMachineModelId(modelIdData.machine_model_id);
            setMachineCustomer(machineData.customer || "");
            setMachineSeriesnumber(machineData.series_number || "");
            setMachineProduct(machineData.product || "");
            setError(null);

            // Show success message
            Swal.fire({
              icon: "success",
              title: "Machine Identified",
              text: `Successfully scanned ${name}`,
              timer: 1500,
              showConfirmButton: false,
            });
          } else {
            throw new Error("Machine or Model ID not found");
          }
        } catch (dbError) {
          console.error("Database Error:", dbError);
          setError(new Error("Error fetching machine data"));
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Unable to retrieve machine data from the database.",
          });
        }
      } else {
        console.error("Invalid QR Format:", scannedData);
        setError(new Error("Invalid QR code format"));
        Swal.fire({
          icon: "error",
          title: "Invalid QR Code",
          text: "The QR Code format is incorrect. Please try again.",
        });
      }
    } catch (err) {
      console.error("QR Processing Error:", err);
      setError(new Error("Error processing QR code"));
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to process the QR Code.",
      });
    }
  };

const handleSubmit = async () => {
  if (!user?.employee_id && (!employeeId || employeeId.length !== 6)) {
    Swal.fire({
      icon: "warning",
      title: "Missing Information",
      text: "Please enter a valid 6-digit employee ID.",
    });
    return;
  }
  
  // ตรวจสอบว่ามี problemType หรือไม่
  if (!problemType) {
    Swal.fire({
      icon: "warning",
      title: "Missing Information",
      text: "Please select a problem type.",
    });
    return;
  }
  
  // ใช้ validateFormData เพื่อตรวจสอบข้อมูลพื้นฐาน
  const validation = validateFormData({ machineId, problemDetail, problemType });

  if (!validation.isValid) {
    Swal.fire({
      icon: "warning",
      title: "Missing Information",
      text: validation.errorMessage,
    });
    return;
  }

  setIsSubmitting(true);

  try {
    // ใช้ console.log ตรวจสอบค่า problemType ก่อนส่ง
    console.log("Problem Type before submit:", problemType);
    
    // Prepare data for API based on required fields from backend
    const downtimeData = {
      machine_id: machineId,
      problem_description: problemDetail,
      problem_type: problemType, // เพิ่ม problem_type เข้าไปโดยตรง
      reported_by: user?.employee_id || employeeId,
      
      // ส่ง work_order ถ้ามี
      work_order: workOrder || null,
      
      // ยังคงส่งค่าเหล่านี้ไปด้วย
      reason_id: selectedReason || null,
      priority: "medium", // ใช้ค่าคงที่
      status: "active",
      shift: getShiftInfo().shift, // ใช้ค่าจากฟังก์ชัน getShiftInfo
      start_time: new Date().toISOString(),
    };

    // ตรวจสอบข้อมูลที่จะส่งไปยัง API
    console.log("Submitting downtime data:", downtimeData);

    // Send request to API
    const response = await submitDowntimeReport(downtimeData, getAuthHeader);

    if (response.success) {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Machine downtime report submitted successfully.",
        confirmButtonText: "OK",
        showConfirmButton: true,
        timer: 1500
      }).then(() => {
        window.location.href = '/main-menu';
      });
    } else {
      throw new Error(response.message || "Failed to submit report");
    }
  } catch (error) {
    console.error("Error submitting downtime report:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to submit the downtime report. Please try again.",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  // Reset the form
  const resetForm = () => {
    setMachineId(null);
    setMachineName("");
    setMachineNumber("");
    setMachineModel("");
    setMachineModelId(null);
    setMachineCustomer("");
    setMachineSeriesnumber("");
    setMachineProduct("");
    setProblemType("");
    setProblemDetail("");
    setSelectedReason("");
    setPriority("medium");
    setWorkOrder("");
    setShift(getCurrentShift());
    setEmployeeId("");
    setShift(getShiftInfo().shift);
    setError(null);
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} p-8`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <AlertTriangle
              className={`w-8 h-8 ${
                darkMode ? "text-red-400" : "text-red-500"
              }`}
            />
            <h2
              className={`text-3xl font-extrabold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Machine Down Report
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <Clock className="w-6 h-6" />
            <span>{formatDate(new Date())}</span>
          </div>
        </div>

        {/* Report Form */}
        <div className={cardClass}>
          <div className="space-y-6">
            {/* QR Scanner */}
            <div className="flex justify-center mb-6">
              <QrScanner
                onScanSuccess={handleQrCodeScanned}
                buttonText="Scan Machine QR Code"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                <p>Error: {error.message}</p>
              </div>
            )}

            {/* Machine Information Component */}
            <DownTimeDisplay
              darkMode={darkMode}
              machineName={machineName}
              machineNumber={machineNumber}
              machineModel={machineModel}
              machineCustomer={machineCustomer}
              machineProduct={machineProduct}
              machineSeriesnumber={machineSeriesnumber}
              employeeId={employeeId}
              user={user}
              setEmployeeId={setEmployeeId}
            />

            {/* Problem Details Component */}
            <DownTimeList
              darkMode={darkMode}
              problemTypes={problemTypes}
              reasonList={reasonList}
              problemType={problemType}
              selectedReason={selectedReason}
              priority={priority}
              workOrder={workOrder}
              shift={shift}
              problemDetail={problemDetail}
              setProblemType={setProblemType}
              setSelectedReason={setSelectedReason}
              setPriority={setPriority}
              setWorkOrder={setWorkOrder}
              setShift={setShift}
              setProblemDetail={setProblemDetail}
            />

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className={`px-4 py-2 rounded-md ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
                disabled={isSubmitting}
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !machineId || !problemDetail}
                className={
                  isSubmitting || !machineId || !problemDetail
                    ? disabledButtonClass
                    : buttonClass
                }
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Submit Report</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MachineDownTimePage;
