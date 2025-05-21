// ./src/app/components/CheckQuality/CheckQualityList.jsx

import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import ImageDisplay from "@/app/components/ImageDisplay";

const CheckQualityList = ({
  loading,
  qualityData,
  unitData,
  handleMeasurementChange,
  inputClass,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <div className="text-lg">Loading quality check items...</div>
      </div>
    );
  }

  if (!qualityData) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-center text-yellow-800 dark:text-yellow-200">
          No quality items found for this machine model.
        </p>
      </div>
    );
  }

  const defaultInputClass =
    "w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const finalInputClass = inputClass || defaultInputClass;

  const isWithinRange = (value, standardValue, tolerance) => {
    if (!value || value === "") return null;
    const numValue = parseFloat(value);
    const numStandard = parseFloat(standardValue);
    const numTolerance = parseFloat(tolerance);
    if (isNaN(numValue) || isNaN(numStandard) || isNaN(numTolerance))
      return null;
    return (
      numValue >= numStandard - numTolerance &&
      numValue <= numStandard + numTolerance
    );
  };

  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-bold">{qualityData.item}</h3>
        <p className="text-gray-600 dark:text-gray-300">
          {qualityData.thaiItem}
        </p>
      </div>

      {/* flex container */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Reference Image */}
        {qualityData.referenceImageUrl && (
          <div className="md:w-1/3 flex items-center justify-center">
            <div className="border rounded-md p-2 inline-block bg-white dark:bg-gray-800">
              <ImageDisplay
                imagePath={qualityData.referenceImageUrl}
                alt="Reference Image"
                className="max-h-40 object-contain"
                type="reference"
              />
            </div>
          </div>
        )}

        {/* Specifications */}
        <div className="md:w-2/3">
          <div className="p-4 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 rounded-md h-full">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <h4 className="font-bold">Specifications</h4>
                <p>
                  Standard Value: {qualityData.standardValue} {qualityData.unit}{" "}
                  Acceptable Tolerance: ±{qualityData.tolerance}{" "}
                  {qualityData.unit}
                </p>
                <p className="text-sm mt-1">
                  Acceptable Range:{" "}
                  {(
                    parseFloat(qualityData.standardValue) -
                    parseFloat(qualityData.tolerance)
                  ).toFixed(3)}{" "}
                  {qualityData.unit} -{" "}
                  {(
                    parseFloat(qualityData.standardValue) +
                    parseFloat(qualityData.tolerance)
                  ).toFixed(3)}{" "}
                  {qualityData.unit}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4">
          Quality Check at {qualityData.unitCount} Unit
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {unitData.map((unit, index) => {
            const isValid = isWithinRange(
              unit.value,
              qualityData.standardValue,
              qualityData.tolerance
            );
            return (
              <div
                key={unit.id}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md"
              >
                <div className="font-medium text-center mb-2">
                  Unit {unit.id}
                </div>
                <input
                  type="text"
                  className={`${finalInputClass} ${
                    isValid === false
                      ? "border-red-300 bg-red-50 dark:bg-red-900"
                      : isValid === true
                      ? "border-green-300 bg-green-50 dark:bg-green-900"
                      : ""
                  } text-center text-xl h-14`}
                  value={unit.value}
                  onChange={(e) =>
                    handleMeasurementChange(index, e.target.value)
                  }
                  placeholder={`${qualityData.standardValue}`}
                />
                {isValid !== null && (
                  <div className="mt-2 flex items-center justify-center text-sm">
                    {isValid ? (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span>Within Range</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 dark:text-red-400">
                        <XCircle className="w-4 h-4 mr-1" />
                        <span>Out of Range</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CheckQualityList;
