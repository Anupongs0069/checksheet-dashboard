// src/app/main-menu/daily-safety-check/page.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useDarkMode } from "../../components/DarkModeProvider";
import QrScanner from "@/app/components/QrScanner";
import { formatDate } from "../../components/DateFormatter";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  CalendarCheck,
  HashIcon,
  CpuIcon,
  WrenchIcon,
  BuildingIcon,
  BoxesIcon,
  Loader2,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";

const getShiftInfo = () => {
  const now = new Date();
  const currentHour = now.getHours();

  // If it is between 00:00-05:59, count it as the night shift of the previous day.
  if (currentHour >= 0 && currentHour < 6) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      shift: 'N',
      date: yesterday.toISOString().split('T')[0],
      checked_at: now.toISOString()
    };
  }

  // If it is between 06:00-17:59, count it as the daytime shift of the current day.
  if (currentHour >= 6 && currentHour < 18) {
    return {
      shift: 'D',
      date: now.toISOString().split('T')[0],
      checked_at: now.toISOString()
    };
  }

  // If it is between 18:00-23:59, count it as the night shift of the current day.
  return {
    shift: 'N',
    date: now.toISOString().split('T')[0],
    checked_at: now.toISOString()
  };
};

const getChecklistFrequency = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();
  const month = now.getMonth() + 1;


  const frequencies = ['daily'];


  if (dayOfWeek === 1) {
    frequencies.push('weekly');
  }


  if (dayOfMonth === 1 || (dayOfWeek === 0 && dayOfMonth === 2)) {
    frequencies.push('monthly');


    if ([1, 4, 7, 10].includes(month)) {
      frequencies.push('quarterly');
    }


    if ([1, 7].includes(month)) {
      frequencies.push('6_months');
    }


    if (month === 1) {
      frequencies.push('yearly');
    }
  }

  return frequencies;
};

function SafetyDailyCheckPage() {
  const { isLoggedIn, user } = useAuth();
  const { darkMode } = useDarkMode();
  const router = useRouter();

  const [machineName, setMachineName] = useState("");
  const [machineNumber, setMachineNumber] = useState("");
  const [machineModel, setMachineModel] = useState("");
  const [machineCustomer, setMachineCustomer] = useState("");
  const [machineProduct, setMachineProduct] = useState("");
  const [machineSeriesnumber, setMachineSeriesnumber] = useState("");
  const [employeeId, setEmployeeId] = useState(user?.employee_id || "");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [checkData, setCheckData] = useState({
    checklist: [],
  });

  // Styling classes
  const cardClass = `p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
    }`;

  const buttonClass = `px-4 py-2 rounded-md text-white ${darkMode
    ? "bg-indigo-600 hover:bg-indigo-700"
    : "bg-blue-600 hover:bg-blue-700"
    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`;

  const inputClass = `w-full px-3 py-2 border rounded-md ${darkMode
    ? "bg-gray-700 border-gray-600 text-white"
    : "bg-gray-100 border-gray-300 text-gray-900"
    } focus:outline-none cursor-not-allowed`;

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

  useEffect(() => {
    const fetchChecklist = async () => {
      if (!showChecklist || !machineName || !machineModel) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const frequencies = getChecklistFrequency();

        const queryParams = new URLSearchParams({
          machineName: machineName,
          model: machineModel,
          frequencies: frequencies.join(',')
        }).toString();

        const endpoint = token
          ? `/api/safetychecklist/items?${queryParams}`
          : `/api/public/safetychecklist/items?${queryParams}`;

        const response = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          },
          signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Inspection items not found. Please check the machine data."
              : "Unable to load the inspection items."
          );
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (!data.success) {
          throw new Error("Inspection items not found.");
        }

        let transformedData;

        if (data.groups) {

          transformedData = {
            checklist: data.groups.flatMap((group) =>
              group.items.map((item) => ({
                id: item.id,
                item: item.item_name.replace(/^\d+\.\d+\s+/, ''),
                thaiItem: item.item_thai_name,
                groupName: group.group.name,
                groupThaiName: group.group.thai_name,
                status: null,
                issueDetail: "",
              }))
            ),
          };
        } else if (data.data) {

          const groupedItems = data.data.reduce((groups, item) => {
            const group = groups[item.group_name] || [];
            group.push(item);
            groups[item.group_name] = group;
            return groups;
          }, {});

          transformedData = {
            checklist: Object.entries(groupedItems).flatMap(
              ([groupName, items]) =>
                items.map((item) => ({
                  id: item.id,
                  item: item.item_name.replace(/^\d+\.\d+\s+/, ''),
                  thaiItem: item.item_thai_name,
                  groupName: item.group_name,
                  groupThaiName: item.group_thai_name,
                  status: null,
                  issueDetail: "",
                }))
            ),
          };
        } else {
          throw new Error("Invalid data format.");
        }

        setCheckData(transformedData);
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

    fetchChecklist();
  }, [showChecklist, machineName, machineModel]);

  const [machineId, setMachineId] = useState(null);

  const handleQrCodeScanned = async (scannedData) => {
    try {

      console.log('Raw QR Data:', scannedData);
      const pattern = /Machine_Name: \[(.*?)\] ,Machine_Number: \[(.*?)\] ,Model: \[(.*?)\]/i;
      const matches = scannedData.match(pattern);

      console.log('Pattern Matches:', matches);

      if (matches && matches.length === 4) {
        const [_, name, number, model] = matches;

        console.log('Extracted Data:', {
          name,
          number,
          model
        });

        try {
          const apiUrl = `/api/public/findmachine?machine_name=${encodeURIComponent(name)}&machine_number=${encodeURIComponent(number)}&model=${encodeURIComponent(model)}`;

          console.log('API URL:', apiUrl);

          const response = await fetch(apiUrl);
          const machineData = await response.json();

          console.log('API Response:', machineData);

          if (machineData) {
            setMachineId(Number(machineData.id));
            setMachineName(name);
            setMachineNumber(number);
            setMachineModel(model);
            setMachineCustomer(machineData.customer);
            setMachineSeriesnumber(machineData.series_number);
            setMachineProduct(machineData.product);
            setEmployeeId("");

            console.log('Setting State:', {
              name,
              number,
              model,
              customer: machineData.customer,
              series_number: machineData.series_number,
              product: machineData.product
            });

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
      } else {
        console.error('Invalid QR Format:', scannedData);
        setError(new Error("Invalid QR code format"));
        Swal.fire({
          icon: "error",
          title: "Invalid QR Code",
          text: "The QR Code format is incorrect. Please try again.",
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

  const handleStatusChange = (itemId, status) => {
    setCheckData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === itemId ? { ...item, status } : item
      ),
    }));
  };

  const handleIssueDetailChange = (itemId, detail) => {
    setCheckData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === itemId ? { ...item, issueDetail: detail } : item
      ),
    }));
  };

  const handleLoadChecklist = () => {
    if (!isLoggedIn && !validateEmployeeId()) {
      return;
    }
    setShowChecklist(true);
  };

  const handleMachineIdle = async () => {
    try {
      if (!isLoggedIn && !validateEmployeeId()) {
        return;
      }

      try {
        const { shift, date } = getShiftInfo();
        const response = await fetch(`/api/public/safety-logs/check?machine_id=${Number(machineId)}&date=${date}&shift=${shift}`);
        const checkResult = await response.json();

        if (checkResult.exists) {
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

      const token = localStorage.getItem("token");
      const apiUrl = `/api/public/safety-inspections`;

      console.log('================== Machine Idle API Call ==================');
      console.log('API URL:', apiUrl);
      console.log('Method:', 'POST');
      console.log('Headers:', {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      });

      const { shift, checked_at } = getShiftInfo();
      const payload = {
        machine_id: machineId,
        checklist_item_id: null,
        checked_by: isLoggedIn ? user?.employee_id : employeeId,
        status: "idle",
        issue_detail: null,
        checked_at: checked_at,
        shift: shift
      };

      console.log('Payload:', payload);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message?.includes('duplicate') || errorData.error?.includes('duplicate')) {
          await Swal.fire({
            icon: "warning",
            title: "Unable to Save",
            text: "This machine has already been inspected today.",
          });
          return;
        }
        throw new Error(errorData.message || "Failed to save inspection");
      }

      const data = await response.json();
      console.log('API Response:', data);
      console.log('====================================================');

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit machine idle status");
      }

      console.log('================== Submit Success ==================');
      console.log('Status: IDLE');
      console.log('API Response:', data);
      console.log('Machine Details:', {
        machine_id: machineId,
        machine_name: machineName,
        model: machineModel,
        checked_by: isLoggedIn ? user?.employee_id : employeeId,
        checked_at: new Date().toISOString()
      });

      console.log('API Response:', data);
      console.log('================================================');

      await Swal.fire({
        icon: "success",
        title: "Save Successful",
        text: "The inspection results have been saved successfully.",
        showConfirmButton: false,
        timer: 1500
      });

      // Reset form
      setMachineName("");
      setMachineNumber("");
      setMachineModel("");
      setMachineCustomer("");
      setMachineProduct("");
      setMachineSeriesnumber("");
      setShowChecklist(false);
      setEmployeeId("");
      setCheckData({ checklist: [] });
    } catch (error) {
      console.error("Error submitting machine idle:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Unable to save the data.",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('🚀 ================ START SUBMISSION PROCESS ================');

      if (!isLoggedIn && !validateEmployeeId()) {
        console.log('❌ Employee ID validation failed');
        return;
      }

      try {
        const { shift, date } = getShiftInfo();
        const response = await fetch(`/api/public/safety-logs/check?machine_id=${Number(machineId)}&date=${date}&shift=${shift}`);
        const checkResult = await response.json();

        if (checkResult.exists) {
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

      const token = localStorage.getItem("token");
      const baseUrl = '/api/public';
      const currentTime = new Date().toISOString();
      const user_id = isLoggedIn ? user?.employee_id : employeeId;

      console.log('📝 Inspection Details:');
      console.log(`- Token: ${token ? 'Present' : 'Not present'}`);
      console.log(`- API URL: ${baseUrl}`);
      console.log(`- Employee ID: ${user_id}`);
      console.log(`- Timestamp: ${currentTime}`);

      // 1. Save main inspection
      const { shift, checked_at } = getShiftInfo();
      const inspectionData = {
        machine_id: machineId,
        checked_by: user_id,
        status: failedItems.length > 0 ? "fail" : "pass",
        checked_at: checked_at,
        shift: shift
      };

      console.log('📤 ================ SAVING INSPECTION ================');
      console.log('Inspection data to save:', inspectionData);

      const inspectionResponse = await fetch(`${baseUrl}/safety-inspections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(inspectionData)
      });

      if (!inspectionResponse.ok) {
        const errorData = await inspectionResponse.json();
        if (errorData.message?.includes('duplicate') || errorData.error?.includes('duplicate')) {
          await Swal.fire({
            icon: "warning",
            title: "Unable to Save",
            text: "This machine has already been inspected today."
          });
          return;
        }
        throw new Error(errorData.message || "Failed to save inspection");
      }

      const inspectionResult = await inspectionResponse.json();
      console.log('✅ Inspection save result:', inspectionResult);

      if (!inspectionResponse.ok) {
        throw new Error(inspectionResult.message || "Failed to save inspection");
      }

      // 2. Save attachments for failed items
      if (failedItems.length > 0 && inspectionResult.data?.[0]?.id) {
        console.log('📎 ================ SAVING ATTACHMENTS ================');
        const safety_inspection_id = inspectionResult.data[0].id;
        console.log(`Inspection ID: ${safety_inspection_id}`);

        const attachmentsData = failedItems.map(item => ({
          safety_inspection_id: safety_inspection_id,
          model_safetylist_item_id: item.id, 
          description: item.issueDetail
        }));

        console.log('Attachments data to save:', attachmentsData);

        const attachmentResponse = await fetch(`${baseUrl}/safety-inspections/attachments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify(attachmentsData)
        });

        const attachmentResult = await attachmentResponse.json();
        console.log('✅ Attachments save result:', attachmentResult);

        if (!attachmentResponse.ok) {
          throw new Error("Failed to save inspection attachments");
        }
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
      console.log('🔄 Resetting form...');
      setMachineName("");
      setMachineNumber("");
      setMachineModel("");
      setMachineCustomer("");
      setMachineProduct("");
      setMachineSeriesnumber("");
      setEmployeeId("");
      setShowChecklist(false);
      setCheckData({ checklist: [] });
      console.log('✅ Form reset complete');
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


  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} p-8`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <ClipboardCheck
              className={`w-8 h-8 ${darkMode ? "text-indigo-400" : "text-indigo-500"
                }`}
            />
            <h2
              className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"
                }`}
            >
              Daily Safety Check
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <CalendarCheck className="w-6 h-6" />
            <span>{formatDate(new Date())}</span>
          </div>
        </div>

        {/* Machine Selection and Check Form */}
        <div className={cardClass}>
          <h3 className="text-xl font-bold mb-4">Inspection Checklist</h3>

          {/* QR Scanner */}
          <div className="flex justify-center mb-6">
            <QrScanner
              onScanSuccess={handleQrCodeScanned}
              buttonText="Scan QR Code"
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
              <p>Error: {error.message}</p>
            </div>
          )}

          {/* Machine Info - แสดงเมื่อสแกน QR สำเร็จ */}
          {machineName && (
            <div className="mb-8">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <CpuIcon className="w-5 h-5" />
                  Machine Information
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please verify the machine details below before proceeding with
                  the inspection.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Machine Name Card */}
                <div
                  className={`p-4 rounded-lg border ${darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CpuIcon className="w-5 h-5 text-blue-500" />
                    <label className="font-medium">Machine Name</label>
                  </div>
                  <input
                    type="text"
                    className={inputClass}
                    value={machineName}
                    placeholder="Machine name will appear after scan"
                    readOnly
                  />
                </div>

                {/* Machine No Card */}
                <div
                  className={`p-4 rounded-lg border ${darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <HashIcon className="w-5 h-5 text-green-500" />
                    <label className="font-medium">Machine Number</label>
                  </div>
                  <input
                    type="text"
                    className={inputClass}
                    value={machineNumber}
                    placeholder="Machine number will appear after scan"
                    readOnly
                  />
                </div>

                {/* Model Card */}
                <div
                  className={`p-4 rounded-lg border ${darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <WrenchIcon className="w-5 h-5 text-purple-500" />
                    <label className="font-medium">Model</label>
                  </div>
                  <input
                    type="text"
                    className={inputClass}
                    value={machineModel}
                    placeholder="Model will appear after scan"
                    readOnly
                  />
                </div>

                {/* Customer Card */}
                <div
                  className={`p-4 rounded-lg border ${darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BuildingIcon className="w-5 h-5 text-orange-500" />
                    <label className="font-medium">Customer</label>
                  </div>
                  <input
                    type="text"
                    className={inputClass}
                    value={machineCustomer}
                    placeholder="Customer will appear after scan"
                    readOnly
                  />
                </div>

                {/* Product Card */}
                <div
                  className={`p-4 rounded-lg border ${darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BoxesIcon className="w-5 h-5 text-red-500" />
                    <label className="font-medium">Product</label>
                  </div>
                  <input
                    type="text"
                    className={inputClass}
                    value={machineProduct}
                    placeholder="Product will appear after scan"
                    readOnly
                  />
                </div>

                {/* Series Number Card */}
                <div
                  className={`p-4 rounded-lg border ${darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <HashIcon className="w-5 h-5 text-indigo-500" />
                    <label className="font-medium">Series Number</label>
                  </div>
                  <input
                    type="text"
                    className={inputClass}
                    value={machineSeriesnumber}
                    placeholder="Series number will appear after scan"
                    readOnly
                  />
                </div>

                {/* Employee ID Card */}
                {!isLoggedIn && (
                  <div
                    className={`p-4 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <label className="font-medium">Employee ID</label>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => {
                          // อนุญาตให้ป้อนได้เฉพาะตัวเลข และไม่เกิน 6 หลัก
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setEmployeeId(value);
                        }}
                        onKeyPress={(e) => {
                          // ป้องกันการป้อนอักขระที่ไม่ใช่ตัวเลข
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        maxLength={6}
                        placeholder="Please enter your employee ID."
                        className={`w-full px-3 py-2 border rounded-md ${darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      />
                      {employeeId.length > 0 && employeeId.length < 6 && (
                        <p className="mt-1 text-sm text-yellow-500">
                          Please enter a 6-digit employee ID.
                        </p>
                      )}
                      {employeeId.length === 6 && (
                        <p className="mt-1 text-sm text-green-500">
                          Employee ID is complete with 6 digits.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Employee ID Display (แสดงเมื่อ login แล้ว) */}
                {isLoggedIn && user?.employee_id && (
                  <div
                    className={`p-4 rounded-lg border ${darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <label className="font-medium">Employee ID</label>
                    </div>
                    <input
                      type="text"
                      className={inputClass}
                      value={user.employee_id}
                      readOnly
                    />
                  </div>
                )}
              </div>

              {/* Load Checklist และ Machine Idle Buttons */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">
                      Ready to Start Inspection
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click the button to load the inspection checklist or mark
                      machine as idle
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleMachineIdle}
                      className={`px-4 py-2 rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150 ease-in-out`}
                    >
                      Machine Idle
                    </button>
                    <button
                      onClick={handleLoadChecklist}
                      className={`${buttonClass} px-6`}
                    >
                      Loading inspection items...
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <div className="text-lg">Loading inspection items...</div>
            </div>
          )}

          {/* Checklist */}
          {showChecklist && !loading && checkData.checklist.length > 0 && (
            <>
              <div className="space-y-4 mt-6">
                {/* Group checklist items by group */}
                {Object.entries(
                  checkData.checklist.reduce((groups, item) => {
                    const group = groups[item.groupName] || [];
                    group.push(item);
                    groups[item.groupName] = group;
                    return groups;
                  }, {})
                ).map(([groupName, items]) => (
                  <div key={groupName} className="border rounded-lg p-4">
                    <h4 className="text-lg font-medium mb-4">
                      {groupName}
                      <span className="block text-sm text-gray-500">
                        {items[0].groupThaiName}
                      </span>
                    </h4>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="font-medium">{item.item}</span>
                              <span className="block text-sm text-gray-500">
                                {item.thaiItem}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleStatusChange(item.id, "pass")
                                }
                                className={`p-2 rounded-md ${item.status === "pass"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                  }`}
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(item.id, "fail")
                                }
                                className={`p-2 rounded-md ${item.status === "fail"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                  }`}
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          {item.status === "fail" && (
                            <textarea
                              value={item.issueDetail}
                              onChange={(e) =>
                                handleIssueDetailChange(item.id, e.target.value)
                              }
                              placeholder="Please provide the details of the issue..."
                              className={`w-full px-3 py-2 border rounded-md ${darkMode
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                                } focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-2`}
                              rows="2"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                className={`${buttonClass} w-full mt-6`}
              >
                Save inspection results
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SafetyDailyCheckPage;
