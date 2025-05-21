// ./src/app/components/CheckQuality/UnitMeasurementComponent.jsx

import React from "react";
import {
  CheckCircle2,
  XCircle,
  Ruler,
  Settings,
  UploadCloud,
  Users,
} from "lucide-react";
import { validateUnitMeasurements } from "./utils/validationUtils";
import Swal from "sweetalert2";
import Image from 'next/image';

/**
 * Component for displaying and managing unit measurements
 */
const UnitMeasurementComponent = ({
  unitData,
  unitCount,
  specValue,
  tolerance,
  unit,
  overallResult,
  darkMode,
  inputClass,
  leadEmployeeId,
  setLeadEmployeeId,
  setUnitData,
  setOverallResult,
  setShowUnits,
  buttonClass,
  handleSubmit,
}) => {
  // Validate measurement for a unit
  const validateUnit = (unitIndex, value) => {
    const numValue = parseFloat(value);
    const newUnitData = [...unitData];

    // Use specified spec value and tolerance if available, otherwise use defaults
    const specValueToUse = specValue ? parseFloat(specValue) : 2.5;
    const toleranceToUse = tolerance ? parseFloat(tolerance) : 1.0;

    // Check if the value is within acceptable range
    const isPassing =
      !isNaN(numValue) &&
      numValue >= specValueToUse - toleranceToUse &&
      numValue <= specValueToUse + toleranceToUse;

    newUnitData[unitIndex] = {
      ...newUnitData[unitIndex],
      value: value === "" ? "" : parseFloat(value).toFixed(3),
      status: value === "" ? null : isPassing ? "pass" : "fail",
    };

    setUnitData(newUnitData);
  };

  // Update issue details for a unit
  const updateIssueDetail = (unitIndex, detail) => {
    const newUnitData = [...unitData];
    newUnitData[unitIndex] = {
      ...newUnitData[unitIndex],
      issue: detail,
    };
    setUnitData(newUnitData);
  };

  // Handle image upload for units
  const handleImageUpload = (unitIndex, event) => {
    const file = event.target.files[0];
    if (file) {
      const newUnitData = [...unitData];
      newUnitData[unitIndex] = {
        ...newUnitData[unitIndex],
        uploadedImage: file.name,
      };
      setUnitData(newUnitData);
    }
  };

  // Calculate overall result based on unit status
  const calculateOverallResult = () => {
    const validationResult = validateUnitMeasurements(unitData);
    
    if (!validationResult.passed) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Measurements",
        text: validationResult.message,
      });
      return;
    }

    // Set the overall result
    const hasFailedUnits = unitData.some((unit) => unit.status === "fail");
    setOverallResult(hasFailedUnits ? "Rej" : "Acc");

    Swal.fire({
      icon: hasFailedUnits ? "warning" : "success",
      title: hasFailedUnits ? "Inspection Failed" : "Inspection Passed",
      text: hasFailedUnits
        ? "Some units failed the quality check."
        : "All units passed the quality check.",
    });
  };

  return (
    <>
      {/* Specification Details */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <h4 className="font-medium">Specification Details</h4>
          </div>
          <div className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            {unitCount} Units Required
          </div>
        </div>
        <div className="flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="text-center">
            <p className="text-lg font-bold">
              SPEC {specValue || "2.5"} (+/- {tolerance || "1.0"}
              {unit})
            </p>
            <div className="mt-2 flex justify-center">
            <Image
                src="/api/placeholder/240/120"
                alt="Specification Reference"
                className="rounded border"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Dashboard */}
      <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <svg
                className="w-5 h-5 text-indigo-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Unit Status Dashboard
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Overall status of measurement units
            </p>
          </div>
          <div className="flex space-x-3">
            <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-sm font-medium">
                {unitData.filter((u) => u.status === "pass").length} Pass
              </span>
            </div>
            <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-sm font-medium">
                {unitData.filter((u) => u.status === "fail").length} Fail
              </span>
            </div>
            <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></span>
              <span className="text-sm font-medium">
                {unitData.filter((u) => u.status === null).length} Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Measurements Grid */}
      <div className="mt-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4 flex justify-between items-center">
          <div>
            <h4 className="text-lg font-medium flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Unit Measurements
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter measurement values for each unit
            </p>
          </div>
          <div className="text-xl font-bold px-4 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-lg">
            {unitCount} Units
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {unitData.map((unit, index) => (
            <div
              key={unit.id}
              className={`p-4 rounded-lg border ${
                unit.status === "pass"
                  ? "border-green-200 dark:border-green-800"
                  : unit.status === "fail"
                  ? "border-red-200 dark:border-red-800"
                  : "border-gray-200 dark:border-gray-700"
              } ${darkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">{unit.name}</label>
                {unit.status === "pass" ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    PASS
                  </span>
                ) : unit.status === "fail" ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    FAIL
                  </span>
                ) : null}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className={`${inputClass} ${
                    unit.status === "fail" ? "border-red-300 dark:border-red-700" : ""
                  }`}
                  value={unit.value}
                  onChange={(e) => validateUnit(index, e.target.value)}
                  placeholder="Enter measurement"
                />
                <span className="flex items-center text-gray-500">{unit || "mm"}</span>
              </div>
              {unit.status === "fail" && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1 text-red-600 dark:text-red-400">
                    Issue Details
                  </label>
                  <textarea
                    value={unit.issue}
                    onChange={(e) => updateIssueDetail(index, e.target.value)}
                    placeholder="Please describe the issue in detail..."
                    className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-md text-sm"
                    rows="2"
                  />
                </div>
              )}

              {/* Image upload for units */}
              {(unit.imageRequired || unit.status === "fail") && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">
                    {unit.imageRequired
                      ? "Upload Image (Required)"
                      : "Upload Image (Optional)"}
                  </label>
                  <div className="flex items-center space-x-2">
                    <label
                      className={`flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-md cursor-pointer ${
                        darkMode
                          ? "border-gray-600 hover:bg-gray-700"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <UploadCloud className="w-5 h-5 mr-2" />
                      <span className="text-sm">
                        {unit.uploadedImage ? unit.uploadedImage : "Choose an image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(index, e)}
                      />
                    </label>
                    {unit.uploadedImage && (
                      <button
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"
                        onClick={() => {
                          const newUnitData = [...unitData];
                          newUnitData[index] = {
                            ...newUnitData[index],
                            uploadedImage: null,
                          };
                          setUnitData(newUnitData);
                        }}
                        title="Remove image"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <h4 className="font-medium">Inspection Results</h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Once you've entered all measurements, click "Calculate Results" to view final inspection status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Result Card */}
          <div
            className={`p-4 rounded-lg border ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-teal-500" />
              <label className="font-medium">Result</label>
            </div>
            <div
              className={`px-3 py-2 rounded-md font-medium text-center text-lg ${
                overallResult === "Acc"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : overallResult === "Rej"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {overallResult === "pending" ? "Pending Inspection" : overallResult}
            </div>
          </div>

          {/* Lead Approval with Employee ID */}
          <div
            className={`p-4 rounded-lg border ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <label className="font-medium">Lead Approval</label>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Lead Employee ID"
                  className={inputClass}
                  value={leadEmployeeId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setLeadEmployeeId(value);
                  }}
                  maxLength={6}
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-4 h-4" />
                <span>Lead ID</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex justify-between">
        <button
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          onClick={() => {
            setShowUnits(false);
            setUnitData([]);
            setOverallResult("pending");
          }}
        >
          Cancel
        </button>
        <div className="space-x-3">
          <button onClick={calculateOverallResult} className={buttonClass}>
            Calculate Results
          </button>
          <button
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition ${
              overallResult === "pending" ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={overallResult === "pending"}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default UnitMeasurementComponent;