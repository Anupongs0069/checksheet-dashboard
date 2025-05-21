// src/app/components/MachineDownDashboard/utils/validationUtils.js

// ฟังก์ชันตรวจสอบรหัสที่เป็นตัวเลข
export const validateNumericId = (id, fieldName = 'ID', requiredLength = 6) => {
  if (!id) {
    return `${fieldName} is required`;
  } else if (id.length !== requiredLength) {
    return `${fieldName} must be ${requiredLength} digits`;
  } else if (!/^\d+$/.test(id)) {
    return `${fieldName} must contain only numbers`;
  }
  return null;
};

export const validateResolutionForm = (formData) => {
  const errors = {};
  
  if (!formData.solution_description) {
    errors.solution_description = 'Solution description is required';
  }
  
  // ใช้ฟังก์ชัน validateNumericId สำหรับตรวจสอบ technician_id
  const technicianIdError = validateNumericId(formData.technician_id, 'Technician ID');
  if (technicianIdError) {
    errors.technician_id = technicianIdError;
  }
  
  if (!formData.end_time) {
    errors.end_time = 'End time is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateMaintenanceAction = (actionData) => {
  const errors = {};
  
  if (!actionData.action_description) {
    errors.action_description = 'Action description is required';
  }
  
  // ใช้ฟังก์ชัน validateNumericId สำหรับตรวจสอบ performed_by
  const performedByError = validateNumericId(actionData.performed_by, 'Performed by ID');
  if (performedByError) {
    errors.performed_by = performedByError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateAssignmentForm = (formData) => {
  const errors = {};
  
  // ใช้ฟังก์ชัน validateNumericId สำหรับตรวจสอบ technician_id
  const technicianIdError = validateNumericId(formData.technician_id, 'Technician ID');
  if (technicianIdError) {
    errors.technician_id = technicianIdError;
  }
  
  if (!formData.technician_name) {
    errors.technician_name = "Technician name is required";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ฟังก์ชันสำหรับจัดการข้อมูลที่เป็นตัวเลขเท่านั้น
export const handleNumericIdInput = (value, maxLength = 6) => {
  // รับเฉพาะตัวเลขและจำกัดความยาว
  return value.replace(/\D/g, '').slice(0, maxLength);
};

// ฟังก์ชันสำหรับแสดงข้อความตรวจสอบ ID
export const getIdValidationMessage = (value, fieldName = 'ID', requiredLength = 6) => {
  if (!value) {
    return null;
  } else if (value.length < requiredLength) {
    return `Please enter a ${requiredLength}-digit ${fieldName}.`;
  } else if (value.length === requiredLength) {
    return `${fieldName} is complete with ${requiredLength} digits.`;
  }
  return null;
};