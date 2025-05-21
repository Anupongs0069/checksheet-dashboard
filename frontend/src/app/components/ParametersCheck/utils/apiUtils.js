// ./src/app/components/ParametersCheck/utils/apiUtils.js

/**
 * Fetch parameter list for a specific machine model
 * @param {number} machineModelId - The machine model ID
 * @param {string|null} token - Auth token if available
 * @returns {Promise<Object>} Parameter data from the API
 */
export const fetchParameterList = async (
  machineModelId,
  programName = null,
  token = null
) => {
  if (!machineModelId) {
    throw new Error("Machine model ID is required");
  }

  const queryParams = new URLSearchParams({
    machineModelId: machineModelId,
  });

  if (programName) {
    queryParams.append("programName", programName);
  }

  const endpoint = token
    ? `/api/public/parameterlist/items?${queryParams}`
    : `/api/public/parameterlist/items?${queryParams}`;

  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "Parameter items not found. Please check the machine data."
        : "Unable to load the parameter items."
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error("Parameter items not found.");
  }

  // Transform the data
  return {
    parameters: data.data.map((item) => ({
      id: item.id,
      item: item.item_name,
      thaiItem: item.item_thai_name,
      standardValue: item.standard_value,
      tolerance: item.tolerance,
      unit: item.unit,
      measuredValue: "",
      status: null,
      issueDetail: "",
    })),
  };
};

export const saveParameterInspection = async (inspectionData, token = null) => {
  const response = await fetch("/api/public/parameter-inspection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(inspectionData),
  });

  const result = await response.json();

  if (!response.ok) {
    if (
      result.message?.includes("duplicate") ||
      result.error?.includes("duplicate")
    ) {
      throw new Error(
        "This machine has already been inspected for this work order."
      );
    }
    throw new Error(result.message || "Failed to save parameter inspection");
  }

  return result;
};

export const saveAttachments = async (
  inspectionId,
  failedItems,
  token = null
) => {
  const attachmentsData = failedItems.map((item) => ({
    parameter_inspection_id: inspectionId,
    model_parameterlist_item_id: item.id,
    description: item.issueDetail,
  }));

  const response = await fetch("/api/public/parameter-inspection/attachments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(attachmentsData),
  });

  if (!response.ok) {
    throw new Error("Failed to save parameter inspection attachments");
  }

  return await response.json();
};

export const findMachineData = async (name, number, model) => {
  try {
    const response = await fetch(
      `/api/public/findmachine?machine_name=${encodeURIComponent(
        name
      )}&machine_number=${encodeURIComponent(
        number
      )}&model=${encodeURIComponent(model)}`
    );

    if (!response.ok) {
      throw new Error("Failed to find machine data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching machine data:", error);
    throw new Error("Unable to retrieve machine data from the database.");
  }
};

export const findModelId = async (name, model) => {
  try {
    const response = await fetch(
      `/api/public/find-model-id?machine_name=${encodeURIComponent(
        name
      )}&model=${encodeURIComponent(model)}`
    );

    if (!response.ok) {
      throw new Error("Failed to find model ID");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching model ID:", error);
    throw new Error("Unable to retrieve model ID from the database.");
  }
};

export const getProgramNames = async (machineModelId) => {
  try {
    const response = await fetch(
      `/api/public/program-names?machine_model_id=${machineModelId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch program names");
    }
    const data = await response.json();
    return data.program_names;
  } catch (error) {
    console.error("Error fetching program names:", error);
    throw new Error("Unable to retrieve program names from the database.");
  }
};


// บันทึกข้อมูลการตรวจวัดค่าพารามิเตอร์
export const saveParameterResults = async (results, token = null) => {
  try {
    const response = await fetch('/api/public/parameter-inspection/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(results)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save parameter results');
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving parameter results:', error);
    throw error;
  }
};