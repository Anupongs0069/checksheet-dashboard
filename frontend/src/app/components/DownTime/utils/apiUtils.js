// ./src/app/components/DownTime/utils/apiUtils.js

import axios from "axios";

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

export const fetchReasons = async (getAuthHeader) => {
  try {
    const response = await axios.get('/api/downtime/reasons', {
      headers: getAuthHeader()
    });
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching downtime reasons:", error);
    return [];
  }
};

export const submitDowntimeReport = async (downtimeData, getAuthHeader) => {
  try {

    console.log("Data being sent to API:", downtimeData);

    const formData = new FormData();

    Object.keys(downtimeData).forEach(key => {
      if (downtimeData[key] !== null && downtimeData[key] !== undefined) {
        formData.append(key, downtimeData[key]);
      }
    });

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await axios.post('/api/downtime', downtimeData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      try {
        await sendTelegramAlert(downtimeData, getAuthHeader);
      } catch (alertError) {
        console.error("Failed to send Telegram alert:", alertError);

      }
    }

    return response.data;
  } catch (error) {
    console.error("Error submitting downtime report:", error);

    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};

export const fetchDowntimeDetail = async (id, authHeader) => {
  try {
    const response = await fetch(`/api/status-machine/${id}`, {
      method: 'GET',
      headers: {
        ...authHeader,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch downtime detail');
    }

    const result = await response.json();
    // ถ้าข้อมูลที่ได้มามี format ที่มี data property ให้คืนค่า result.data
    return result.data || result;
  } catch (error) {
    console.error('Error fetching downtime detail:', error);
    throw error;
  }
};

export const returnDowntimeForEdits = async (machineId, data, authHeader) => {
  try {
    // ใช้ updateMachineStatus เพื่อเปลี่ยนสถานะเครื่องเป็น active
    const response = await updateMachineStatus(
      machineId,
      data.status, // active
      '' // ล้างค่า technician_id
    );

    // บันทึกเหตุผลในการส่งกลับโดยใช้ console.log (เนื่องจากไม่มี API เฉพาะ)
    console.log("Return reason:", data.return_reason);
    console.log("Leader ID:", data.leader_id);
    console.log("Leader name:", data.leader_name);
    console.log("Return time:", data.returned_at);

    return {
      success: true,
      message: "Successfully returned for edits",
      data: response
    };
  } catch (error) {
    console.error("Error returning downtime for edits:", error);
    throw error;
  }
};

export const updateMachineStatus = async (machineId, status, updatedBy = '', additionalNotes = '') => {
  try {
    if (!machineId) {
      throw new Error("Machine ID is required");
    }
    const response = await axios.put(
      `/api/status-machine/${machineId}/status`,
      {
        status: status,
        updated_by: updatedBy,
        additional_notes: additionalNotes,
        updated_at: new Date().toISOString(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating machine status:", error);
    throw error;
  }
};

export const sendTelegramAlert = async (downtimeData, getAuthHeader) => {
  try {
    console.log("Sending Telegram alert:", downtimeData);
    
    const alertData = {
      data: {
        status: "Machine Breakdown",
        machine_name: downtimeData.machine_name,
        machine_number: downtimeData.machine_number,
        issue_type: downtimeData.problem_type,
        description: downtimeData.problem_description,
        reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        reporter: {
          employeeNumber: downtimeData.reported_by
        }
      }
    };

    const response = await fetch('/api/proxy-alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(alertData)
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Telegram alert sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending Telegram alert:", error);
    throw error;
  }
};