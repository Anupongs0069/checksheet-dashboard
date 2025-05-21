// ./src/app/components/DailyCheck/MachineDailyCheckForm.jsx

import React, { useState, useEffect } from "react";
import QrScanner from "@/app/components/QrScanner";
import MachineInfoDisplay from "./MachineInfoDisplay";
import ActionButtons from "./ActionButtons";
import ChecklistDisplaySection from "./ChecklistDisplaySection";
import { parseQrCodeData } from "../DailyCheck/utils/qrScannerUtils";
import {
  findMachineByDetails,
  checkMachineInspectionStatus,
  fetchMachineChecklist,
  getShiftInfo,
  saveMachineInspection,
  saveInspectionAttachments,
  saveMachineAsIdle
} from "../DailyCheck/utils/machineApiUtils";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import FrequencySelector from "./FrequencySelector";

const MachineDailyCheckForm = ({ isLoggedIn, user, darkMode }) => {
  const router = useRouter();

  // Machine state
  const [machineId, setMachineId] = useState(null);
  const [machineName, setMachineName] = useState("");
  const [machineNumber, setMachineNumber] = useState("");
  const [machineModel, setMachineModel] = useState("");
  const [machineCustomer, setMachineCustomer] = useState("");
  const [machineProduct, setMachineProduct] = useState("");
  const [machineSeriesnumber, setMachineSeriesnumber] = useState("");

  // User state
  const [employeeId, setEmployeeId] = useState(user?.employee_id || "");

  // UI state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [checkData, setCheckData] = useState({
    checklist: [],
  });

  // frequencies state
  const [frequencies, setFrequencies] = useState({
    is_daily: true,  // Default to true for daily
    is_weekly: false,
    is_monthly: false,
    is_quarterly: false,
    is_6_months: false,
    is_yearly: false
  });

  // Styling classes
  const cardClass = `p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
    }`;

  const buttonClass = `px-4 py-2 rounded-md text-white ${darkMode
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-blue-600 hover:bg-blue-700"
    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`;

  // Validate employee ID
  const validateEmployeeId = () => {
    if (!employeeId.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Please enter your employee ID.",
        text: "Please enter your employee ID before performing the inspection.",
      });
      return false;
    }
    return true;
  };

  // Fetch checklist when machine and showChecklist change
  useEffect(() => {
    const loadChecklist = async () => {
      if (!showChecklist || !machineName || !machineModel) return;

      try {
        setLoading(true);
        // แก้ไขตรงนี้: ส่ง frequencies ไปด้วย
        const transformedData = await fetchMachineChecklist(machineName, machineModel, frequencies);
        setCheckData(transformedData);
        setError(null);
      } catch (error) {
        console.error("Error fetching checklist:", error);

        let errorMessage = "Unable to load the inspection items.";
        if (error.name === "AbortError") {
          errorMessage = "Connection timed out. Please try again.";
        }

        setError(error);
        Swal.fire({
          icon: "error",
          title: "An error occurred.",
          text: error.message || errorMessage,
        });
        setShowChecklist(false);
      } finally {
        setLoading(false);
      }
    };

    loadChecklist();
  }, [showChecklist, machineName, machineModel, frequencies]);

  // Handle QR code scanning
  const handleQrCodeScanned = async (scannedData) => {
    try {
      const parsedData = parseQrCodeData(scannedData);

      if (!parsedData) {
        throw new Error("Invalid QR code format");
      }

      const { name, number, model } = parsedData;

      try {
        const machineData = await findMachineByDetails(name, number, model);

        if (machineData) {
          setMachineId(Number(machineData.id));
          setMachineName(name);
          setMachineNumber(number);
          setMachineModel(model);
          setMachineCustomer(machineData.customer);
          setMachineSeriesnumber(machineData.series_number);
          setMachineProduct(machineData.product);
          setEmployeeId(isLoggedIn ? user?.employee_id : "");

          setError(null);
          setShowChecklist(false);
          setCheckData({ checklist: [] });
        } else {
          throw new Error("Machine not found in database");
        }
      } catch (dbError) {
        console.error('Database Error:', dbError);
        setError(new Error("Error fetching machine data"));
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to retrieve machine data from the database.",
        });
      }
    } catch (err) {
      console.error('QR Processing Error:', err);
      setError(new Error("Error processing QR code"));
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to process the QR Code.",
      });
    }
  };

  // Update item status
  const handleStatusChange = (itemId, status) => {
    setCheckData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === itemId ? { ...item, status } : item
      ),
    }));
  };

  // Update issue details
  const handleIssueDetailChange = (itemId, detail) => {
    setCheckData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === itemId ? { ...item, issueDetail: detail } : item
      ),
    }));
  };

  // Load checklist
  const handleLoadChecklist = () => {
    if (!isLoggedIn && !validateEmployeeId()) {
      return;
    }
    setShowChecklist(true);
  };

  // Mark machine as idle
  const handleMachineIdle = async () => {
    try {
      console.log('================== Machine Idle Process Started ==================');

      if (!isLoggedIn && !validateEmployeeId()) {
        return;
      }

      try {
        const exists = await checkMachineInspectionStatus(machineId);
        if (exists) {
          const { shift } = getShiftInfo();
          await Swal.fire({
            icon: "warning",
            title: "Unable to Save",
            text: `This machine has already been inspected during the ${shift === 'D' ? 'day shift' : 'night shift'}.`
          });
          return;
        }
      } catch (checkError) {
        console.error('Error checking machine status:', checkError);
        throw new Error('Unable to check the save status.');
      }

      const result = await Swal.fire({
        title: "Confirm Save Machine Idle",
        text: "Do you want to save the machine status as Idle?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        return;
      }

      const { shift, checked_at } = getShiftInfo();
      const payload = {
        machine_id: machineId,
        checklist_item_id: null,
        checked_by: isLoggedIn ? user?.employee_id : employeeId,
        status: "idle",
        issue_detail: null,
        checked_at: checked_at,
        shift: shift,
        // เพิ่ม frequencies ตรงนี้
        ...frequencies
      };

      const data = await saveMachineAsIdle(payload);

      await Swal.fire({
        icon: "success",
        title: "Save Successful",
        text: "The inspection results have been saved successfully.",
        showConfirmButton: false,
        timer: 1500
      });

      // Reset form
      resetForm();

    } catch (error) {
      console.error("Error submitting machine idle:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Unable to save the data.",
      });
    }
  };

  // Submit inspection results
  const handleSubmit = async () => {
    try {
      console.log('🚀 ================ START SUBMISSION PROCESS ================');

      if (!isLoggedIn && !validateEmployeeId()) {
        console.log('❌ Employee ID validation failed');
        return;
      }

      try {
        const exists = await checkMachineInspectionStatus(machineId);
        if (exists) {
          const { shift } = getShiftInfo();
          await Swal.fire({
            icon: "warning",
            title: "Unable to Save",
            text: `This machine has already been inspected during the ${shift === 'D' ? 'day shift' : 'night shift'}.`
          });
          return;
        }
      } catch (checkError) {
        console.error('Error checking machine status:', checkError);
        throw new Error('Unable to verify save status.');
      }

      const uncheckedItems = checkData.checklist.filter(item => item.status === null);
      console.log(`📊 Unchecked items: ${uncheckedItems.length}`);
      if (uncheckedItems.length > 0) {
        console.log('Details of unchecked items:', uncheckedItems);
        await Swal.fire({
          icon: "warning",
          title: "Please Complete the Check",
          text: "Please ensure that all items have been thoroughly checked."
        });
        return;
      }

      const failedItems = checkData.checklist.filter(item => item.status === "fail");
      console.log(`🔴 Failed items: ${failedItems.length}`);

      if (failedItems.length > 0) {
        console.log('Details of failed items:', failedItems);
        if (failedItems.some(item => !item.issueDetail?.trim())) {
          console.log('❌ Found failed items without details');
          await Swal.fire({
            icon: "warning",
            title: "Please Provide Details",
            text: "Please specify details for the items that did not pass the inspection."
          });
          return;
        }
      }

      // 1. Save main inspection
      const { shift, checked_at } = getShiftInfo();
      const user_id = isLoggedIn ? user?.employee_id : employeeId;

      const inspectionData = {
        machine_id: machineId,
        checked_by: user_id,
        status: failedItems.length > 0 ? "fail" : "pass",
        checked_at: checked_at,
        shift: shift,
        ...frequencies
      };

      const inspectionResult = await saveMachineInspection(inspectionData);

      // 2. Save attachments for failed items
      if (failedItems.length > 0 && inspectionResult.data?.[0]?.id) {
        const inspection_id = inspectionResult.data[0].id;
        await saveInspectionAttachments(inspection_id, failedItems);
      }

      console.log('🎉 ================ SUBMISSION SUCCESSFUL ================');
      await Swal.fire({
        icon: "success",
        title: "Save Successful",
        text: "The inspection results have been saved successfully.",
        showConfirmButton: false,
        timer: 1500
      });

      // Reset form
      resetForm();
      console.log('🏁 ================ END OF PROCESS ================');

    } catch (error) {
      console.error("❌ Error occurred:", error);
      console.error("Stack trace:", error.stack);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Unable to save the data."
      });
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setMachineName("");
    setMachineNumber("");
    setMachineModel("");
    setMachineCustomer("");
    setMachineProduct("");
    setMachineSeriesnumber("");
    setEmployeeId("");
    setShowChecklist(false);
    setCheckData({ checklist: [] });
  };

  return (
    <div className={cardClass}>
      <h3 className="text-xl font-bold mb-4">Inspection Checklist</h3>

      {/* QR Scanner */}
      <div className="flex justify-center mb-6">
        <QrScanner
          onScanSuccess={handleQrCodeScanned}
          buttonText="Scan QR Code"
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
          <p>Error: {error.message}</p>
        </div>
      )}

      {/* Machine Info - shown after scanning QR successfully */}
      {machineName && (
        <>
          <MachineInfoDisplay
            darkMode={darkMode}
            machineName={machineName}
            machineNumber={machineNumber}
            machineModel={machineModel}
            machineCustomer={machineCustomer}
            machineProduct={machineProduct}
            machineSeriesnumber={machineSeriesnumber}
            employeeId={employeeId}
            isLoggedIn={isLoggedIn}
            user={user}
            setEmployeeId={setEmployeeId}
          />

          <FrequencySelector
            frequencies={frequencies}
            onChange={setFrequencies}
          />

          {/* Action Buttons */}
          <ActionButtons
            darkMode={darkMode}
            handleLoadChecklist={handleLoadChecklist}
            handleMachineIdle={handleMachineIdle}
          />
        </>
      )}

      {/* Checklist Display Section */}
      <ChecklistDisplaySection
        loading={loading}
        showChecklist={showChecklist}
        checkData={checkData}
        darkMode={darkMode}
        handleStatusChange={handleStatusChange}
        handleIssueDetailChange={handleIssueDetailChange}
        handleSubmit={handleSubmit}
        buttonClass={buttonClass}
      />
    </div>
  );
};

export default MachineDailyCheckForm;