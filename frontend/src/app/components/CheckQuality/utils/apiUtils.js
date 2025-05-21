// ./src/app/components/CheckQuality/utils/apiUtils.js

"use client";

const apiCache = {
  codeUnits: {},
  qualityItems: {},
};

export const fetchQualityItems = async (
  machineModelId,
  codeUnit,
  dimensionCheck
) => {
  try {
    if (!machineModelId) {
      throw new Error("Machine Model ID is required");
    }
    
    // สร้าง cache key
    const cacheKey = `${machineModelId}-${codeUnit || ""}-${
      dimensionCheck || ""
    }`;
    
    // ตรวจสอบ cache
    if (apiCache.qualityItems[cacheKey]) {
      console.log("Using cached quality items:", cacheKey);
      return apiCache.qualityItems[cacheKey];
    }
    
    const params = new URLSearchParams();
    params.append("machineModelId", machineModelId);
    
    if (codeUnit) {
      params.append("barCodeUnit", codeUnit); // เปลี่ยนจาก codeUnit เป็น barCodeUnit
    }
    
    if (dimensionCheck) {
      params.append("specLength", dimensionCheck); // เปลี่ยนจาก dimensionCheck เป็น specLength
    }
    
    const queryString = params.toString();
    const url = `/api/public/quality/items?${queryString}`;
    console.log("Fetching quality items from:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // เปลี่ยนจาก force-cache เป็น no-store เพื่อป้องกันการแคช
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch quality items: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log("API Response:", responseData);
    
    let result = [];
    if (responseData.success && Array.isArray(responseData.data)) {
      result = responseData.data;
    } else if (Array.isArray(responseData)) {
      result = responseData;
    } else {
      console.log("Unexpected response format:", responseData);
      result = [];
    }
    
    // เก็บผลลัพธ์ใน cache
    apiCache.qualityItems[cacheKey] = result;
    
    return result;
  } catch (error) {
    console.error("Error fetching quality items:", error);
    throw error;
  }
};

export const submitQualityInspection = async (inspectionData) => {
  try {
    const response = await fetch("/api/public/quality/complete-measurements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inspectionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to submit quality inspection"
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error submitting quality inspection:", error);
    throw error;
  }
};

export const fetchMachines = async () => {
  try {
    const response = await fetch("/api/public/quality-machine-logs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch machines: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching machines:", error);
    throw error;
  }
};

export const fetchMachineModels = async () => {
  try {
    const response = await fetch("/api/public/quality-machine-models-logs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch machine models: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching machine models:", error);
    throw error;
  }
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

export const fetchCodeUnits = async (machineModelId) => {
  try {
    delete apiCache.codeUnits[machineModelId];

    if (!machineModelId) {
      throw new Error("Machine Model ID is required");
    }

    const timestamp = new Date().getTime();
    const url = `/api/public/quality/items?machineModelId=${machineModelId}&_t=${timestamp}`;
    console.log("Fetching code units from API:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch code units: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Code Units API Response:", responseData);

    let items = [];
    if (responseData.success && Array.isArray(responseData.data)) {
      items = responseData.data;
    } else if (Array.isArray(responseData)) {
      items = responseData;
    }

    console.log("Raw items before processing:", JSON.stringify(items, null, 2));

    const uniqueCodeUnits = items.reduce((acc, item) => {
      if (
        item.barCodeUnit &&
        !acc.some((u) => u.code_unit === item.barCodeUnit)
      ) {
        acc.push({
          id: item.id,
          code_unit: item.barCodeUnit,
        });
      }
      return acc;
    }, []);

    console.log("Processed uniqueCodeUnits:", uniqueCodeUnits);

    return uniqueCodeUnits;
  } catch (error) {
    console.error("Error fetching code units:", error);
    return [];
  }
};

export const fetchSpecOptions = async (machineModelId, codeUnit) => {
  try {
    if (!machineModelId || !codeUnit || codeUnit === "") {
      console.log("Missing required parameters for fetchSpecOptions");
      return [];
    }

    const url = `/api/public/quality/items?machineModelId=${machineModelId}&barCodeUnit=${codeUnit}`;
    console.log("Fetching specifications from API:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      cache: "no-store",
    });

    console.log("Spec API Response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch specification options: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Specification response data:", data);

    let result = [];
    if (data.success && Array.isArray(data.data)) {
      console.log(
        "Setting spec options with data.data:",
        data.data.length,
        "items"
      );
      result = data.data;
    } else if (Array.isArray(data)) {
      console.log(
        "Setting spec options with direct array:",
        data.length,
        "items"
      );
      result = data;
    } else {
      console.log("Unexpected response format:", data);
      result = [];
    }

    return result;
  } catch (error) {
    console.error("Error fetching specification options:", error);
    throw error;
  }
};
