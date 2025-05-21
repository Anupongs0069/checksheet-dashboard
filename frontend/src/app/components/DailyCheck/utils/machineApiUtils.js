// ./src/app/components/DailyCheck/utils/machineApiUtils.js

/**
 * Utility functions for machine API interactions
 */

/**
 * Get shift information based on current time
 * @returns {Object} Shift information including shift type, date and checked_at timestamp
 */
export const getShiftInfo = () => {
  const now = new Date();
  const currentHour = now.getHours();

  // If it is between 00:00-05:59, count it as the night shift of the previous day.
  if (currentHour >= 0 && currentHour < 6) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      shift: "N",
      date: yesterday.toISOString().split("T")[0],
      checked_at: now.toISOString(),
    };
  }

  // If it is between 06:00-17:59, count it as the daytime shift of the current day.
  if (currentHour >= 6 && currentHour < 18) {
    return {
      shift: "D",
      date: now.toISOString().split("T")[0],
      checked_at: now.toISOString(),
    };
  }

  // If it is between 18:00-23:59, count it as the night shift of the current day.
  return {
    shift: "N",
    date: now.toISOString().split("T")[0],
    checked_at: now.toISOString(),
  };
};

/**
 * Get checklist frequency based on current date
 * @returns {Array} Array of applicable frequencies
 */
/*
export const getChecklistFrequency = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();
  const month = now.getMonth() + 1;

  const frequencies = ["daily"];

  if (dayOfWeek === 1) {
    frequencies.push("weekly");
  }

  if (dayOfMonth === 1 || (dayOfWeek === 0 && dayOfMonth === 2)) {
    frequencies.push("monthly");

    if ([1, 4, 7, 10].includes(month)) {
      frequencies.push("quarterly");
    }

    if ([1, 7].includes(month)) {
      frequencies.push("6_months");
    }

    if (month === 1) {
      frequencies.push("yearly");
    }
  }

  return frequencies;
};
*/

/**
 * Find machine by details
 * @param {string} name - Machine name
 * @param {string} number - Machine number
 * @param {string} model - Machine model
 * @returns {Promise<Object>} Machine data
 */
export const findMachineByDetails = async (name, number, model) => {
  try {
    const apiUrl = `/api/public/findmachine?machine_name=${encodeURIComponent(
      name
    )}&machine_number=${encodeURIComponent(number)}&model=${encodeURIComponent(
      model
    )}`;

    console.log("API URL:", apiUrl);

    const response = await fetch(apiUrl);
    const machineData = await response.json();

    console.log("API Response:", machineData);

    return machineData;
  } catch (error) {
    console.error("Error fetching machine:", error);
    throw new Error("Failed to fetch machine data");
  }
};

/**
 * Check if machine has already been inspected
 * @param {number} machineId - Machine ID
 * @returns {Promise<boolean>} Whether machine has been inspected
 */
export const checkMachineInspectionStatus = async (machineId) => {
  try {
    const { shift, date } = getShiftInfo();
    const response = await fetch(
      `/api/public/daily-machine-logs/check?machine_id=${Number(
        machineId
      )}&date=${date}&shift=${shift}`
    );
    const checkResult = await response.json();

    return checkResult.exists;
  } catch (error) {
    console.error("Error checking machine status:", error);
    throw new Error("Unable to check the save status.");
  }
};

/**
 * Fetch checklist items for a machine
 * @param {string} machineName - Machine name
 * @param {string} machineModel - Machine model
 * @param {Object} frequencyFlags - Flags for different frequencies
 * @returns {Promise<Object>} Checklist data
 */
export const fetchMachineChecklist = async (
  machineName,
  machineModel,
  frequencyFlags = null
) => {
  try {
    const token = localStorage.getItem("token");

    if (!frequencyFlags) {
      const frequencies = getChecklistFrequency();
      frequencyFlags = {
        is_daily: frequencies.includes("daily"),
        is_weekly: frequencies.includes("weekly"),
        is_monthly: frequencies.includes("monthly"),
        is_quarterly: frequencies.includes("quarterly"),
        is_6_months: frequencies.includes("6_months"),
        is_yearly: frequencies.includes("yearly"),
      };
    }

    // query parameters
    const queryParams = new URLSearchParams({
      machineName: machineName,
      model: machineModel,
      ...frequencyFlags,
    }).toString();

    const endpoint = token
      ? `/api/public/checklist/items?${queryParams}`
      : `/api/public/checklist/items?${queryParams}`;

    {
      /* // เพิ่ม console.log ตรงนี้เพื่อดูว่าส่งอะไรออกไป */
    }
    console.log("Fetching checklist with URL:", endpoint);
    console.log("Query parameters:", {
      machineName,
      model: machineModel,
      ...frequencyFlags,
    });
    {
      /* // เพิ่ม console.log ตรงนี้เพื่อดูว่าส่งอะไรออกไป */
    }

    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      signal: AbortSignal.timeout(10000),
    });

    {
      /* // เพิ่ม console.log เพื่อดูผลลัพธ์ response */
    }
    console.log("API response status:", response.status);
    {
      /* // เพิ่ม console.log เพื่อดูผลลัพธ์ response */
    }

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
            item: item.item_name.replace(/^\d+\.\d+\s+/, ""),
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
        checklist: Object.entries(groupedItems).flatMap(([groupName, items]) =>
          items.map((item) => ({
            id: item.id,
            item: item.item_name.replace(/^\d+\.\d+\s+/, ""),
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

    return transformedData;
  } catch (error) {
    console.error("Error fetching checklist:", error);
    throw error;
  }
};

/**
 * Save machine inspection data
 * @param {Object} inspectionData - Inspection data
 * @returns {Promise<Object>} Saved inspection data
 */
export const saveMachineInspection = async (inspectionData) => {
  const token = localStorage.getItem("token");
  const baseUrl = "/api/public";

  console.log("📤 ================ SAVING INSPECTION ================");
  console.log("Inspection data to save:", inspectionData);

  const inspectionResponse = await fetch(`${baseUrl}/inspections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(inspectionData),
  });

  if (!inspectionResponse.ok) {
    const errorData = await inspectionResponse.json();
    if (
      errorData.message?.includes("duplicate") ||
      errorData.error?.includes("duplicate")
    ) {
      throw new Error("This machine has already been inspected today.");
    }
    throw new Error(errorData.message || "Failed to save inspection");
  }

  const inspectionResult = await inspectionResponse.json();
  console.log("✅ Inspection save result:", inspectionResult);

  return inspectionResult;
};

/**
 * Save machine inspection attachments (issues)
 * @param {number} inspectionId - Inspection ID
 * @param {Array} failedItems - Items that failed inspection
 * @returns {Promise<Object>} Saved attachment data
 */
export const saveInspectionAttachments = async (inspectionId, failedItems) => {
  const token = localStorage.getItem("token");
  const baseUrl = "/api/public";

  console.log("📎 ================ SAVING ATTACHMENTS ================");
  console.log(`Inspection ID: ${inspectionId}`);

  const attachmentsData = failedItems.map((item) => ({
    inspection_id: inspectionId,
    model_checklist_item_id: item.id,
    description: item.issueDetail,
  }));

  console.log("Attachments data to save:", attachmentsData);

  const attachmentResponse = await fetch(`${baseUrl}/inspections/attachments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(attachmentsData),
  });

  const attachmentResult = await attachmentResponse.json();
  console.log("✅ Attachments save result:", attachmentResult);

  if (!attachmentResponse.ok) {
    throw new Error("Failed to save inspection attachments");
  }

  return attachmentResult;
};

/**
 * Save machine as idle
 * @param {Object} payload - Idle machine data
 * @returns {Promise<Object>} Response data
 */
export const saveMachineAsIdle = async (payload) => {
  const token = localStorage.getItem("token");
  const apiUrl = `/api/public/inspections`;

  console.log("================== Machine Idle API Call ==================");
  console.log("API URL:", apiUrl);
  console.log("Method:", "POST");
  console.log("Payload:", payload);

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
    if (
      errorData.message?.includes("duplicate") ||
      errorData.error?.includes("duplicate")
    ) {
      throw new Error("This machine has already been inspected today.");
    }
    throw new Error(errorData.message || "Failed to save inspection");
  }

  const data = await response.json();
  console.log("API Response:", data);

  return data;
};
