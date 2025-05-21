// ./src/app/components/DownTime/utils/validationUtils.js
export const validateMachineData = (machineData) => {
  const { machineId, machineName, machineNumber, machineModel } = machineData;
  return Boolean(machineId && machineName && machineNumber && machineModel);
};

export const validateFormData = (formData) => {
  const { machineId, problemDetail, problemType } = formData;
  
  if (!machineId) {
    return {
      isValid: false,
      errorMessage: "Please scan a machine QR code first."
    };
  }
  
  if (!problemType) {
    return {
      isValid: false,
      errorMessage: "Please select a problem type."
    };
  }
  
  if (!problemDetail || problemDetail.trim().length < 10) {
    return {
      isValid: false,
      errorMessage: "Please provide a detailed problem description (minimum 10 characters)."
    };
  }
  
  return {
    isValid: true,
    errorMessage: ""
  };
};

export const validateEmployeeId = (employeeId) => {
  if (!employeeId) {
    return {
      isValid: false,
      message: "Employee ID is required."
    };
  }
  
  if (!/^\d{6}$/.test(employeeId)) {
    return {
      isValid: false,
      message: "Employee ID must be 6 digits."
    };
  }
  
  return {
    isValid: true,
    message: "Employee ID is valid."
  };
};