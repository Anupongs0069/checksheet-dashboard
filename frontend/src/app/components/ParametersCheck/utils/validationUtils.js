// src/app/components/ParametersCheck/utils/validationUtils.js

import Swal from "sweetalert2";

/**
 * Validate if employee ID is provided
 * @param {string} employeeId - Employee ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateEmployeeId = (employeeId) => {
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

/**
 * Validate if all required fields are filled
 * @param {string} workOrder - Work order value
 * @param {string} productName - Product name value
 * @param {string} programName - Program name value
 * @returns {boolean} True if all fields valid, false otherwise
 */
export const validateAdditionalFields = (workOrder, productName, programName) => {
  if (!workOrder.trim() || !productName.trim() || !programName.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Missing Information",
      text: "Please fill in all required fields (Work Order, Product Name, and Program Name).",
    });
    return false;
  }
  return true;
};