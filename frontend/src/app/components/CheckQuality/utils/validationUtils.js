// ./src/app/components/CheckQuality/utils/validationUtils.js

import Swal from "sweetalert2";

export const validateEmployeeId = (employeeId, isLoggedIn) => {
  if (!isLoggedIn && !employeeId.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Please enter your employee ID.",
      text: "Please enter your employee ID before performing the inspection.",
    });
    return false;
  }
  return true;
};

export const validateAdditionalFields = (workOrder, codeUnit) => {
  if (!workOrder.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Missing Information",
      text: "Please enter Work Order number.",
    });
    return false;
  }
  if (!codeUnit.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Missing Information",
      text: "Please select a Code Unit.",
    });
    return false;
  }
  return true;
};

export const validateUnitMeasurements = (unitData) => {
  const pendingUnits = unitData.filter(unit => unit.status === null);
  if (pendingUnits.length > 0) {
    return {
      passed: false,
      message: `Please complete all ${pendingUnits.length} remaining unit measurements.`,
      type: "incomplete_measurements"
    };
  }
  const failedUnitsWithoutDetails = unitData.filter(
    unit => unit.status === 'fail' && !unit.issue.trim()
  );
  if (failedUnitsWithoutDetails.length > 0) {
    return {
      passed: false,
      message: `Please provide issue details for ${failedUnitsWithoutDetails.length} failed units.`,
      type: "missing_issue_details"
    };
  }
  const unitsNeedingImages = unitData.filter(
    unit => unit.imageRequired && !unit.uploadedImage
  );
  if (unitsNeedingImages.length > 0) {
    return {
      passed: false,
      message: `Please upload images for ${unitsNeedingImages.length} units that require them.`,
      type: "missing_images"
    };
  }
  return { passed: true };
};

export const validateQualityItems = (qualityItems) => {
  const uncheckedItems = qualityItems.filter(item => item.status === null);
  if (uncheckedItems.length > 0) {
    return {
      passed: false,
      message: "Please ensure that all quality items have been checked.",
      type: "unchecked_items"
    };
  }
  const failedItems = qualityItems.filter(item => item.status === "fail");
  if (failedItems.length > 0) {
    if (failedItems.some(item => !item.issueDetail?.trim())) {
      return {
        passed: false,
        message: "Please specify details for the items that did not pass the quality check.",
        type: "missing_issue_details"
      };
    }
  }
  // Check for required images
  const itemsNeedingImages = qualityItems.filter(
    item => item.imageRequired && !item.uploadedImage
  );
  if (itemsNeedingImages.length > 0) {
    return {
      passed: false,
      message: "Please upload images for all required quality check items.",
      type: "missing_images"
    };
  }
  return { passed: true };
};