// src/app/main-menu/check-parameters/page.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useDarkMode } from "@/app/components/DarkModeProvider";
import QrScanner from "@/app/components/QrScanner";
import { formatDate } from "@/app/components/DateFormatter";
import { useRouter } from "next/navigation";
import { Settings2, CalendarCheck } from "lucide-react";
import Swal from "sweetalert2";

// Import modular components
import ParametersInfoDisplay from "@/app/components/ParametersCheck/ParametersInfoDisplay";
import ParametersList from "@/app/components/ParametersCheck/ParametersList";

// Import utilities
import { getShiftInfo } from "@/app/components/ParametersCheck/utils/shiftUtils";
import { validateEmployeeId, validateAdditionalFields } from "@/app/components/ParametersCheck/utils/validationUtils";
import {
  fetchParameterList,
 // checkExistingInspection,
  saveParameterInspection,
  saveAttachments,
  saveParameterResults,
  findMachineData,
  findModelId,
  getProgramNames
} from "@/app/components/ParametersCheck/utils/apiUtils";

function CheckParametersPage() {
  const { isLoggedIn, user } = useAuth();
  const { darkMode } = useDarkMode();
  const router = useRouter();

  // Machine information states
  const [machineName, setMachineName] = useState("");
  const [machineNumber, setMachineNumber] = useState("");
  const [machineModel, setMachineModel] = useState("");
  const [machineCustomer, setMachineCustomer] = useState("");
  const [machineProduct, setMachineProduct] = useState("");
  const [machineSeriesnumber, setMachineSeriesnumber] = useState("");
  const [machineModelId, setMachineModelId] = useState(null);
  const [machineId, setMachineId] = useState(null);

  // User information
  const [employeeId, setEmployeeId] = useState(user?.employee_id || "");

  // UI states
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showParameters, setShowParameters] = useState(false);

  // Parameter data
  const [parameterData, setParameterData] = useState({
    parameters: [],
  });

  // Additional fields
  const [workOrder, setWorkOrder] = useState("");
  const [productName, setProductName] = useState("");
  const [programName, setProgramName] = useState("");
  const [programNameRequired, setProgramNameRequired] = useState(false);
  const [programNames, setProgramNames] = useState([]);

  // Card style class
  const cardClass = `p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`;

  /**
   * Fetch parameters when showParameters state changes
   */
  useEffect(() => {
    const loadParameters = async () => {
      console.log('🔄 useEffect Triggered');
      console.log('Show Parameters:', showParameters);
      console.log('Machine Model ID:', machineModelId);

      if (!showParameters || !machineModelId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (programNameRequired && programName) {
          console.log('Loading parameters with program name:', programName);
          const data = await fetchParameterList(machineModelId, programName, token);
          setParameterData(data);
        } else if (!programNameRequired) {
          console.log('Loading parameters without program name');
          const data = await fetchParameterList(machineModelId, null, token);
          setParameterData(data);
        } else {
          console.log('Program name required but not selected');
          Swal.fire({
            icon: "warning",
            title: "Program Name Required",
            text: "Please select a Program Name first."
          });
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error fetching parameters:", error);
        let errorMessage = "Unable to load the parameter items.";
        if (error.name === "AbortError") {
          errorMessage = "Connection timed out. Please try again.";
        }
        setError(error);
        Swal.fire({
          icon: "error",
          title: "An error occurred.",
          text: error.message || errorMessage,
        });
        setShowParameters(false);
      } finally {
        setLoading(false);
      }
    };

    loadParameters();
  }, [showParameters, machineModelId, programName, programNameRequired]);

  const handleQrCodeScanned = async (scannedData) => {
    try {
      console.log('Raw QR Data:', scannedData);
      const pattern = /Machine_Name: \[(.*?)\] ,Machine_Number: \[(.*?)\] ,Model: \[(.*?)\]/i;
      const matches = scannedData.match(pattern);
      console.log('Pattern Matches:', matches);

      if (matches && matches.length === 4) {
        const [_, name, number, model] = matches;
        console.log('Extracted Data:', { name, number, model });

        try {
          // 1. Find machine data
          const machineData = await findMachineData(name, number, model);
          console.log('Machine Data:', machineData);

          // 2. Get machine model ID
          const modelIdData = await findModelId(name, model);
          console.log('Model ID Data:', modelIdData);

          if (machineData && modelIdData.machine_model_id) {
            // Set machine basic information
            setMachineId(Number(machineData.id));
            setMachineName(name);
            setMachineNumber(number);
            setMachineModel(model);
            setMachineModelId(modelIdData.machine_model_id);
            setMachineCustomer(machineData.customer);
            setMachineSeriesnumber(machineData.series_number);
            setMachineProduct(machineData.product);
            setEmployeeId("");
            setError(null);
            setShowParameters(false);
            setParameterData({ parameters: [] });

            // 3. Check if program name is required
            if ([9, 13, 15, 16].includes(modelIdData.machine_model_id)) {
              // For machines requiring program name (e.g., HEAT STAKING)
              setProgramNameRequired(true);

              try {
                const programsData = await getProgramNames(modelIdData.machine_model_id);
                console.log('Program data received:', programsData);

                if (Array.isArray(programsData) && programsData.length > 0) {
                  console.log('Setting program names for dropdown');
                  setProgramNames(programsData);
                  setProgramNameRequired(true);
                }
                else {
                  setProgramNameRequired(false);
                  Swal.fire({
                    title: "Program Data Not Found",
                    text: "No Program Name found for this machine.",
                    icon: "warning"
                  });
                }
              } catch (programError) {
                console.error('Error fetching program names:', programError);
                setProgramNameRequired(false);
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "Unable to retrieve Program Name data.",
                });
              }
            } else {
              // For regular machines, no program name required
              setProgramNameRequired(false);
              setProgramName("");
            }
          } else {
            throw new Error("Machine or Model ID not found");
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

  /**
   * Handle measured value changes
   * @param {number} itemId - Parameter item ID
   * @param {string} value - Measured value
   */
  const handleMeasuredValueChange = (itemId, value) => {
    setParameterData((prev) => ({
      ...prev,
      parameters: prev.parameters.map((item) => {
        if (item.id === itemId) {
          // Convert to number
          const numValue = parseFloat(value);
          const numStandard = parseFloat(item.standardValue);
          const numTolerance = parseFloat(item.tolerance);

          // Auto-determine status based on value
          let newStatus = null;
          if (!isNaN(numValue) && !isNaN(numStandard) && !isNaN(numTolerance)) {
            // If measured value is within standard ± tolerance
            newStatus = Math.abs(numValue - numStandard) <= numTolerance ? "pass" : "fail";
          }

          return {
            ...item,
            measuredValue: value,
            status: newStatus,
            // If fail, require description
            issueDetail: newStatus === "fail" ? (item.issueDetail || "") : ""
          };
        }
        return item;
      }),
    }));
  };

  /**
   * Handle issue detail changes
   * @param {number} itemId - Parameter item ID
   * @param {string} detail - Issue detail
   */
  const handleIssueDetailChange = (itemId, detail) => {
    setParameterData((prev) => ({
      ...prev,
      parameters: prev.parameters.map((item) =>
        item.id === itemId ? { ...item, issueDetail: detail } : item
      ),
    }));
  };

  /**
   * Load parameters
   */
  const handleLoadParameters = () => {
    console.log('🔍 Load Parameters Clicked');
    console.log('Machine Model ID:', machineModelId);
    console.log('Is Employee ID Valid:', validateEmployeeId(employeeId));
    console.log('Are Additional Fields Valid:', validateAdditionalFields(workOrder, productName, programName));

    if (!isLoggedIn && !validateEmployeeId(employeeId)) {
      return;
    }
    if (!validateAdditionalFields(workOrder, productName, programName)) {
      return;
    }
    setShowParameters(true);
  };

  /**
   * Submit form data
   */
  const handleSubmit = async () => {
    try {
      console.log('🚀 ================ START SUBMISSION PROCESS ================');
  
      if (!isLoggedIn && !validateEmployeeId(employeeId)) {
        console.log('❌ Employee ID validation failed');
        return;
      }
  
      if (!validateAdditionalFields(workOrder, productName, programName)) {
        console.log('❌ Additional fields validation failed');
        return;
      }
  
      const uncheckedItems = parameterData.parameters.filter(item => item.status === null);
      console.log(`📊 Unchecked items: ${uncheckedItems.length}`);
      if (uncheckedItems.length > 0) {
        console.log('Details of unchecked items:', uncheckedItems);
        await Swal.fire({
          icon: "warning",
          title: "Please Complete the Check",
          text: "Please ensure that all parameters have been measured and checked."
        });
        return;
      }
  
      const failedItems = parameterData.parameters.filter(item => item.status === "fail");
  
      if (failedItems.length > 0) {
        if (failedItems.some(item => !item.issueDetail?.trim())) {
          await Swal.fire({
            icon: "warning",
            title: "Please Provide Details",
            text: "Please specify details for the parameters that did not pass the inspection."
          });
          return;
        }
      }
  
      const token = localStorage.getItem("token");
      const user_id = isLoggedIn ? user?.employee_id : employeeId;
  
      console.log('📝 Inspection Details:');
      console.log(`- Token: ${token ? 'Present' : 'Not present'}`);
      console.log(`- Employee ID: ${user_id}`);
  
      // 1. Save main inspection
      const { shift, checked_at } = getShiftInfo();
      const inspectionData = {
        machine_id: machineId,
        checked_by: user_id,
        status: failedItems.length > 0 ? "fail" : "pass",
        checked_at: checked_at,
        shift: shift,
        work_order: workOrder,
        product_name: productName,
        program_name: programName
      };
  
      console.log('📤 ================ SAVING PARAMETER INSPECTION ================');
      console.log('Inspection data to save:', inspectionData);
  
      const inspectionResult = await saveParameterInspection(inspectionData, token);
      console.log('✅ Inspection save result:', inspectionResult);
  
      // ดึง inspection_id จากผลลัพธ์การบันทึก
      if (inspectionResult.data && inspectionResult.data.length > 0) {
        const inspection_id = inspectionResult.data[0].id;
        
        // 2. Save attachments for failed items
        if (failedItems.length > 0) {
          console.log('📎 ================ SAVING ATTACHMENTS ================');
          console.log(`Inspection ID: ${inspection_id}`);
  
          const attachmentResult = await saveAttachments(inspection_id, failedItems, token);
          console.log('✅ Attachments save result:', attachmentResult);
        }
        
        console.log('📊 ================ SAVING PARAMETER RESULTS ================');
        const resultsToSave = parameterData.parameters.map(param => ({
          parameter_inspection_id: inspection_id,
          model_parameterlist_item_id: param.id,
          measured_value: param.measuredValue,
          is_passed: param.status === "pass",
          notes: param.status === "fail" ? param.issueDetail : null
        }));
        
        console.log('Results data to save:', resultsToSave);
        
        try {
          const resultsData = await saveParameterResults(resultsToSave, token);
          console.log('✅ Parameter results saved successfully:', resultsData);
        } catch (resultsError) {
          console.error('❌ Error saving parameter results:', resultsError);
        }
      }
  
      console.log('🎉 ================ SUBMISSION SUCCESSFUL ================');
      await Swal.fire({
        icon: "success",
        title: "Save Successful",
        text: "The parameter inspection results have been saved successfully.",
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
      setWorkOrder("");
      setProductName("");
      setProgramName("");
      setShowParameters(false);
      setParameterData({ parameters: [] });
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

  /*
  const handleResetProgramSelection = () => {
    setProgramName("");
    setParameterData({ parameters: [] });
    setError(null);
    setShowParameters(false);
  };
  */

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} p-8`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Settings2 color="#0bf95e"
              className={`w-8 h-8 ${darkMode ? "text-indigo-400" : "text-indigo-500"}`}
            />
            <h2
              className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Machine Parameter Check
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <CalendarCheck className="w-6 h-6" />
            <span>{formatDate(new Date())}</span>
          </div>
        </div>

        {/* Machine Selection and Check Form */}
        <div className={cardClass}>
          <h3 className="text-xl font-bold mb-4">Parameter Inspection</h3>

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

          {/* Machine Info - shown after QR scan */}
          {machineName && (
            <ParametersInfoDisplay
              machineInfo={{
                machineName,
                machineNumber,
                machineModel,
                machineCustomer,
                machineProduct,
                machineSeriesnumber
              }}
              isLoggedIn={isLoggedIn}
              user={user}
              darkMode={darkMode}
              employeeId={employeeId}
              workOrder={workOrder}
              productName={productName}
              programName={programName}
              programNameRequired={programNameRequired}
              programNames={programNames}
              onEmployeeIdChange={setEmployeeId}
              onWorkOrderChange={setWorkOrder}
              onProductNameChange={setProductName}
              onProgramNameChange={setProgramName}
              onLoadParameters={handleLoadParameters}
            />
          )}

          {/* Parameters List */}
          <ParametersList
            loading={loading}
            showParameters={showParameters}
            parameterData={parameterData}
            darkMode={darkMode}
            onMeasuredValueChange={handleMeasuredValueChange}
            onIssueDetailChange={handleIssueDetailChange}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default CheckParametersPage;