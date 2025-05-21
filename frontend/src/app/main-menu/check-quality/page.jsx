// ./src/app/main-menu/check-quality/page.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useDarkMode } from "../../components/DarkModeProvider";
import QrScanner from "@/app/components/QrScanner";
import { formatDate } from "../../components/DateFormatter";
import { useRouter } from "next/navigation";
import {
  XCircle,
  CalendarCheck,
  CheckSquare,
  Users,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";

// Import utility functions
import { getShiftInfo } from "@/app/components/CheckQuality/utils/shiftUtils";
import {
  validateEmployeeId,
  validateAdditionalFields,
} from "@/app/components/CheckQuality/utils/validationUtils";
import {
  fetchQualityItems,
  findModelId,
  findMachineData,
  fetchCodeUnits,
  fetchSpecOptions,
} from "@/app/components/CheckQuality/utils/apiUtils";

// Import components
import CheckQualityInfoDisplay from "@/app/components/CheckQuality/CheckQualityInfoDisplay";
import CheckQualityList from "@/app/components/CheckQuality/CheckQualityList";
import UnitMeasurementComponent from "@/app/components/CheckQuality/UnitMeasurementComponent";

function CheckQualityPage() {
  const { isLoggedIn, user } = useAuth();
  const { darkMode } = useDarkMode();
  const router = useRouter();

  // Original machine data state
  const [machineName, setMachineName] = useState("");
  const [machineNumber, setMachineNumber] = useState("");
  const [machineModel, setMachineModel] = useState("");
  const [machineCustomer, setMachineCustomer] = useState("");
  const [machineProduct, setMachineProduct] = useState("");
  const [machineSeriesnumber, setMachineSeriesnumber] = useState("");
  const [machineModelId, setMachineModelId] = useState(null);
  const [machineId, setMachineId] = useState(null);
  const [employeeId, setEmployeeId] = useState(user?.employee_id || "");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showQualityItems, setShowQualityItems] = useState(false);
  const [leadEmployeeId, setLeadEmployeeId] = useState("");

  // Original quality data state
  const [qualityData, setQualityData] = useState({
    qualityItems: [],
  });

  // Additional fields for quality checks
  const [workOrder, setWorkOrder] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [tolerance, setTolerance] = useState("");
  const [unit, setUnit] = useState("mm");
  const [leadApproved, setLeadApproved] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [dimensionCheck, setDimensionCheck] = useState("");

  // New unit-related states (from NN version)
  const [unitCount, setUnitCount] = useState(5);
  const [showUnits, setShowUnits] = useState(false);
  const [overallResult, setOverallResult] = useState("pending");
  const [unitData, setUnitData] = useState([]);

  // Changed from barCodeUnit to codeUnit
  const [codeUnit, setCodeUnit] = useState("");
  const [codeUnitOptions, setCodeUnitOptions] = useState([]);

  const [specOptions, setSpecOptions] = useState([]);

  // Function to fetch code unit options
  const fetchCodeUnitOptions = async () => {
    if (!machineModelId) {
      console.log("Cannot fetch code units: No machine model ID");
      return;
    }

    try {
      setLoading(true);
      console.log("Starting to fetch code units for model ID:", machineModelId);

      const units = await fetchCodeUnits(machineModelId);
      console.log("Raw units from API:", units);

      if (units && units.length > 0) {
        console.log("Setting code unit options with", units.length, "items");
        setCodeUnitOptions(units);
      } else {
        console.log("No code units found or empty array returned");
        setCodeUnitOptions([]);
      }
    } catch (error) {
      console.error("Error in fetchCodeUnitOptions:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to load code unit options: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Styling classes
  const cardClass = `p-6 rounded-lg shadow-md ${
    darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
  }`;

  const onWorkOrderChange = (value) => setWorkOrder(value);
  const onProductNameChange = (value) => setProductName(value);
  const onDimensionCheckChange = (value) => setDimensionCheck(value);

  const buttonClass = `px-4 py-2 rounded-md text-white ${
    darkMode
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-blue-600 hover:bg-blue-700"
  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`;

  const inputClass = `w-full px-3 py-2 border rounded-md ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-gray-100 border-gray-300 text-gray-900"
  } focus:outline-none`;

  const readOnlyInputClass = `${inputClass} cursor-not-allowed`;

  // Load unit specifications
  const loadUnitSpecifications = () => {
    if (
      !validateEmployeeId(employeeId, isLoggedIn) ||
      !validateAdditionalFields(workOrder, codeUnit)
    ) {
      return;
    }

    // For demo: Random number of units (5-9)
    const requiredUnitCount = Math.floor(Math.random() * 5) + 5;
    setUnitCount(requiredUnitCount);

    const newUnitData = Array.from({ length: requiredUnitCount }, (_, i) => ({
      id: i + 1,
      name: `Unit${i + 1}`,
      value: "",
      status: null,
      issue: "",
      imageRequired: i % 3 === 0,
      uploadedImage: null,
    }));

    setUnitData(newUnitData);
    setShowUnits(true);
    setShowQualityItems(false);
  };


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
            setShowQualityItems(false);
            setQualityData({ qualityItems: [] });

            // Reset form fields
            setCodeUnit("");
            setProductName("");
            setWorkOrder("");
            setDimensionCheck("");

            // After setting the machineModelId, fetch code unit options
            await fetchCodeUnitOptions();
            console.log("Finished fetching code units");
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

  useEffect(() => {
    const loadSpecOptions = async () => {
      if (codeUnit && codeUnit !== "") {
        try {
          setLoading(true);
          console.log(
            "Code Unit changed to:",
            codeUnit,
            "Fetching specifications..."
          );
          const specs = await fetchSpecOptions(machineModelId, codeUnit);
          setSpecOptions(specs);
        } catch (error) {
          console.error("Error loading specifications:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Unable to load specification options: " + error.message,
          });
          setSpecOptions([]);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No valid Code Unit, clearing spec options");
        setSpecOptions([]);
        setDimensionCheck("");
      }
    };

    loadSpecOptions();
  }, [codeUnit, machineModelId]);

  const handleLoadQualityItems = () => {
    console.log("=== Start Inspection clicked ===");
    console.log("Current data:", {
      machineModelId,
      codeUnit,
      dimensionCheck,
      workOrder,
      employeeId,
    });

    if (!validateEmployeeId(employeeId, isLoggedIn)) {
      console.log("Employee ID validation failed");
      return;
    }

    if (!validateAdditionalFields(workOrder, codeUnit)) {
      console.log("Additional fields validation failed");
      return;
    }

    console.log("Validation passed, setting showQualityItems to true");
    setShowQualityItems(true);
    setShowUnits(false);
  };

  // Handle status change for quality items
  const handleStatusChange = (itemId, status) => {
    setQualityData((prev) => ({
      ...prev,
      qualityItems: prev.qualityItems.map((item) =>
        item.id === itemId ? { ...item, status } : item
      ),
    }));
  };

  // Handle issue detail change for quality items
  const handleIssueDetailChange = (itemId, detail) => {
    setQualityData((prev) => ({
      ...prev,
      qualityItems: prev.qualityItems.map((item) =>
        item.id === itemId ? { ...item, issueDetail: detail } : item
      ),
    }));
  };

  useEffect(() => {
    const fetchQualityCheckItems = async () => {
      if (!showQualityItems || !machineModelId) return;

      try {
        setLoading(true);
        const items = await fetchQualityItems(
          machineModelId,
          codeUnit,
          dimensionCheck
        );
        console.log("Quality items fetched:", items);

        if (items && items.length > 0) {
          setQualityData({ qualityItems: items });
          setError(null);
        } else {
          console.log("No quality items found");
          setQualityData({ qualityItems: [] });
        }
      } catch (error) {
        console.error("Error fetching quality items:", error);
        setError(error);
        Swal.fire({
          icon: "error",
          title: "An error occurred.",
          text: error.message || "Unable to load the quality check items.",
        });
        setShowQualityItems(false);
      } finally {
        setLoading(false);
      }
    };

    fetchQualityCheckItems();
  }, [showQualityItems, machineModelId, codeUnit, dimensionCheck]);

  useEffect(() => {
    if (machineModelId) {
      console.log(
        "machineModelId changed, fetching code units:",
        machineModelId
      );
      fetchCodeUnitOptions();
    }
  }, [machineModelId]);

  const handleSubmit = async () => {
    try {
      console.log(
        "🚀 ================ START SUBMISSION PROCESS ================"
      );

      if (!isLoggedIn && !validateEmployeeId(employeeId, isLoggedIn)) {
        console.log("❌ Employee ID validation failed");
        return;
      }

      if (!validateAdditionalFields(workOrder, codeUnit)) {
        console.log("❌ Additional fields validation failed");
        return;
      }

      if (showUnits) {
        if (overallResult === "pending") {
          await Swal.fire({
            icon: "warning",
            title: "Calculate Results First",
            text: "Please calculate the results before saving.",
          });
          return;
        }
      } else if (showQualityItems) {
        const hasFailedUnits = unitData.some((unit) => unit.status === "fail");
        const updatedQualityItems = qualityData.qualityItems.map((item) => ({
          ...item,
          status: hasFailedUnits ? "fail" : "pass",
        }));

        const uncheckedItems = updatedQualityItems.filter(
          (item) => item.status === null
        );
        console.log(`📊 Unchecked items: ${uncheckedItems.length}`);
        if (uncheckedItems.length > 0) {
          console.log("Details of unchecked items:", uncheckedItems);
          await Swal.fire({
            icon: "warning",
            title: "Please Complete the Check",
            text: "Please ensure that all quality items have been checked.",
          });
          return;
        }

        setQualityData({ qualityItems: updatedQualityItems });
        console.log("✅ Updated Quality Items:", updatedQualityItems);

        const failedItems = updatedQualityItems.filter(
          (item) => item.status === "fail"
        );
        console.log(`🔴 Failed items: ${failedItems.length}`);

        if (failedItems.length > 0) {
          console.log("Details of failed items:", failedItems);
          if (failedItems.some((item) => !item.issueDetail?.trim())) {
            console.log("❌ Found failed items without details");
            await Swal.fire({
              icon: "warning",
              title: "Please Provide Details",
              text: "Please specify details for the items that did not pass the quality check.",
            });
            return;
          }
        }

        const itemsNeedingImages = updatedQualityItems.filter(
          (item) => item.imageRequired && !item.uploadedImage
        );

        if (itemsNeedingImages.length > 0) {
          console.log("❌ Items missing required images:", itemsNeedingImages);
          await Swal.fire({
            icon: "warning",
            title: "Images Required",
            text: "Please upload images for all required quality check items.",
          });
          return;
        }
      } else {
        await Swal.fire({
          icon: "warning",
          title: "No Inspection Data",
          text: "Please load either quality items or unit specifications first.",
        });
        return;
      }

      const { shift } = getShiftInfo();

      const completeMeasurementData = {
        measurementData: {
          machine_id: machineId,
          machine_model_id: machineModelId,
          quality_item_id: qualityData.qualityItems[0]?.id || 1,
          employee_id: employeeId,
          lead_employee_id: leadEmployeeId,
          work_order: workOrder,
          barcode_unit: codeUnit,
          shift: shift,
          standard_value: qualityData.qualityItems[0]?.standardValue || 0,
          tolerance: qualityData.qualityItems[0]?.tolerance || 0,
          unit: qualityData.qualityItems[0]?.unit || "mm",
          overall_result: showUnits
            ? overallResult
            : qualityData.qualityItems.some((item) => item.status === "fail")
            ? "fail"
            : "pass",
          remarks: "",
        },
        points: (() => {
          // ส่วนนี้ไม่ต้องเปลี่ยน
          console.log("Debug unitData:", unitData);
          console.log("Debug qualityData:", qualityData?.qualityItems);
          console.log("showUnits:", showUnits);
          console.log("showQualityItems:", showQualityItems);

          if (showUnits && unitData.length > 0) {
            return unitData.map((item) => ({
              point_number: item.id,
              measured_value: parseFloat(item.value || 0),
              status: item.status || "pass",
              issue_detail: item.issue || null,
            }));
          } else if (showQualityItems) {
            const qualityItem = qualityData.qualityItems[0];
            if (
              qualityItem &&
              qualityItem.unitCount > 0 &&
              unitData.length > 0
            ) {
              console.log(
                "Using unitData for measurement points. Count:",
                unitData.length
              );
              return unitData.map((item) => ({
                point_number: item.id,
                measured_value: parseFloat(item.value || 0),
                status: item.status || "pass",
                issue_detail: item.issueDetail || null,
              }));
            } else {
              console.log(
                "Using qualityItems for points. Count:",
                qualityData.qualityItems.length
              );
              return qualityData.qualityItems.map((item) => ({
                point_number: item.id,
                measured_value: parseFloat(item.value || 0),
                status: item.status || "pass",
                issue_detail: item.issueDetail || null,
              }));
            }
          }

          console.log("No valid points data found");
          return [];
        })(),
      };

      console.log(
        "Sending data to API:",
        JSON.stringify(completeMeasurementData, null, 2)
      );

      try {
        const response = await fetch("/api/quality/complete-measurements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(completeMeasurementData),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to save inspection data");
        }

        await Swal.fire({
          icon: "success",
          title: "Save Successful",
          text: "The quality inspection results have been saved successfully.",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        console.error("API Error:", error);
        throw new Error("Failed to save data: " + error.message);
      }

      // Reset form
      console.log("🔄 Resetting form...");
      setMachineName("");
      setMachineNumber("");
      setMachineModel("");
      setMachineCustomer("");
      setMachineProduct("");
      setMachineSeriesnumber("");
      setEmployeeId("");
      setWorkOrder("");
      setCodeUnit("");
      setLeadEmployeeId("");
      setImageUrl("");
      setShowQualityItems(false);
      setQualityData({ qualityItems: [] });
      setShowUnits(false);
      setUnitData([]);
      setOverallResult("pending");
      setProductName("");
      setDimensionCheck("");
      setCodeUnitOptions([]);
      console.log("✅ Form reset complete");
      console.log("🏁 ================ END OF PROCESS ================");
    } catch (error) {
      console.error("❌ Error occurred:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Unable to save the data.",
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
            <CheckSquare
              className={`w-8 h-8 ${
                darkMode ? "text-indigo-400" : "text-indigo-500"
              }`}
            />
            <h2
              className={`text-3xl font-extrabold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Quality Check
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <CalendarCheck className="w-6 h-6" />
            <span>{formatDate(new Date())}</span>
          </div>
        </div>

        {/* Machine Selection and Check Form */}
        <div className={cardClass}>
          <h3 className="text-xl font-bold mb-4">Quality Inspection</h3>

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
            <CheckQualityInfoDisplay
              machineData={{
                machineName,
                machineNumber,
                machineModel,
                machineCustomer,
                machineProduct,
                machineSeriesnumber,
              }}
              codeUnit={codeUnit}
              setCodeUnit={setCodeUnit}
              leadEmployeeId={leadEmployeeId}
              setLeadEmployeeId={setLeadEmployeeId}
              employeeId={employeeId}
              setEmployeeId={setEmployeeId}
              isLoggedIn={isLoggedIn}
              user={user}
              darkMode={darkMode}
              inputClass={inputClass}
              readOnlyInputClass={readOnlyInputClass}
              workOrder={workOrder}
              onWorkOrderChange={onWorkOrderChange}
              productName={productName}
              onProductNameChange={onProductNameChange}
              dimensionCheck={dimensionCheck}
              onDimensionCheckChange={onDimensionCheckChange}
              specOptions={specOptions}
              codeUnitOptions={codeUnitOptions}
              fetchCodeUnitOptions={fetchCodeUnitOptions}
            />
          )}

          {/* Begin Quality Inspection */}
          {machineName && (
            <div className="mt-6 text-right">
              <button
                onClick={handleLoadQualityItems}
                className={`${buttonClass} bg-green-600 hover:bg-green-700 focus:ring-green-500`}
              >
                <span className="flex items-center justify-center gap-1">
                  <CheckSquare className="w-4 h-4" />
                  Start Inspection
                </span>
              </button>
            </div>
          )}

          {/* Quality Items List */}
          {showQualityItems && !showUnits && (
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <div className="text-lg">Loading quality check items...</div>
                </div>
              ) : (
                <>
                  {qualityData.qualityItems &&
                  qualityData.qualityItems.length > 0 ? (
                    <>
                      {(() => {
                        const unitItem = qualityData.qualityItems.find(
                          (item) => item.unitCount > 0
                        );

                        if (unitItem) {
                          if (!unitData || unitData.length === 0) {
                            const count = unitItem.unitCount || 5;
                            const newUnitData = Array.from(
                              { length: count },
                              (_, i) => ({
                                id: i + 1,
                                name: `Unit${i + 1}`,
                                value: "",
                                status: null,
                              })
                            );

                            setTimeout(() => setUnitData(newUnitData), 0);
                          }

                          return (
                            <CheckQualityList
                              loading={false}
                              qualityData={unitItem}
                              unitData={unitData || []}
                              handleMeasurementChange={(index, value) => {
                                const newUnitData = [...(unitData || [])];
                                if (index >= 0 && index < newUnitData.length) {
                                  // ตรวจสอบว่าค่าที่กรอกอยู่ในช่วงที่ยอมรับได้หรือไม่
                                  const numValue = parseFloat(value);
                                  const numStandard = parseFloat(
                                    unitItem.standardValue
                                  );
                                  const numTolerance = parseFloat(
                                    unitItem.tolerance
                                  );

                                  // ตรวจสอบว่าค่าอยู่ในช่วงหรือไม่
                                  const isWithinAcceptableRange =
                                    !isNaN(numValue) &&
                                    !isNaN(numStandard) &&
                                    !isNaN(numTolerance) &&
                                    numValue >= numStandard - numTolerance &&
                                    numValue <= numStandard + numTolerance;

                                  // อัปเดตทั้ง value และ status
                                  newUnitData[index] = {
                                    ...newUnitData[index],
                                    value: value,
                                    status:
                                      value === ""
                                        ? null
                                        : isWithinAcceptableRange
                                        ? "pass"
                                        : "fail",
                                  };

                                  setUnitData(newUnitData);
                                }
                              }}
                              darkMode={darkMode}
                              inputClass={inputClass}
                            />
                          );
                        } else {
                          return (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <p className="text-center text-yellow-800 dark:text-yellow-200">
                                No quality items with unit measurements found
                                for this machine model.
                              </p>
                            </div>
                          );
                        }
                      })()}

                      {/* Lead Employee ID Field */}
                      <div className="mt-6 mb-4 max-w-md">
                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode
                              ? "bg-gray-800 border-gray-700"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-green-500" />
                            <label className="font-medium">
                              Lead Employee ID
                            </label>
                          </div>
                          <input
                            type="text"
                            placeholder="Enter lead employee ID"
                            className={`w-full px-3 py-2 border rounded-md ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            value={leadEmployeeId}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6);
                              setLeadEmployeeId(value);
                            }}
                            onKeyPress={(e) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            maxLength={6}
                          />
                          {leadEmployeeId.length > 0 &&
                            leadEmployeeId.length < 6 && (
                              <p className="mt-1 text-sm text-yellow-500">
                                Please enter a 6-digit Lead Employee ID.
                              </p>
                            )}
                          {leadEmployeeId.length === 6 && (
                            <p className="mt-1 text-sm text-green-500">
                              Lead Employee ID is complete with 6 digits.
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Save Button */}
                      <button
                        onClick={() => {
                          console.log("Submitting Quality Inspection...");
                          console.log("Lead Employee ID:", leadEmployeeId);
                          console.log("Unit Data:", unitData);
                          console.log("Quality Data:", qualityData);

                          handleSubmit();
                        }}
                        className={`${buttonClass} w-full`}
                      >
                        Save Quality Inspection Results
                      </button>
                    </>
                  ) : (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-center text-yellow-800 dark:text-yellow-200">
                        No quality items found for this machine model.
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Unit Measurements - New UI */}
          {showUnits && !showQualityItems && (
            <UnitMeasurementComponent
              unitData={unitData}
              unitCount={unitCount}
              specValue={specValue}
              tolerance={tolerance}
              unit={unit}
              overallResult={overallResult}
              darkMode={darkMode}
              inputClass={inputClass}
              leadEmployeeId={leadEmployeeId}
              setLeadEmployeeId={setLeadEmployeeId}
              setUnitData={setUnitData}
              setOverallResult={setOverallResult}
              setShowUnits={setShowUnits}
              buttonClass={buttonClass}
              handleSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckQualityPage;
