// ./src/app/components/MachineDownDashboard/pages/ResolveForm.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useAuth } from "@/contexts/AuthContext";
import { useDarkMode } from "@/app/components/DarkModeProvider";
import {
  AlertTriangle,
  ChevronLeft,
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  Hash,
} from "lucide-react";

import {
  fetchDowntimeDetail as fetchDowntimeById,
  resolveDowntime,
  updateMachineStatus,
} from "../utils/apiUtils";

import { getCurrentDateTime, formatLongDateTime } from "../utils/formatUtils";
import {
  validateResolutionForm,
  validateAssignmentForm,
} from "../utils/validationUtils";
import ImageUploader from "../shared/ImageUploader";

const handleNumericIdInput = (value, maxLength = 6) => {
  return value.replace(/\D/g, "").slice(0, maxLength);
};

export default function ResolveForm({ id }) {
  const router = useRouter();
  const { user, getAuthHeader } = useAuth();
  const { darkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downtimeData, setDowntimeData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [maintenanceStartTime, setMaintenanceStartTime] = useState(null);

  const [formData, setFormData] = useState({
    solution_description: "",
    technician_id: "",
    end_time: getCurrentDateTime(),
  });

  const [image, setImage] = useState(null);

  useEffect(() => {
    const loadDowntimeDetail = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await fetchDowntimeById(id, getAuthHeader());
        setDowntimeData(data);
        console.log("Downtime detail data:", data);

        if (data.maintenance_start_time) {
          setMaintenanceStartTime(
            new Date(data.maintenance_start_time).toLocaleString()
          );
        } else {
          setMaintenanceStartTime("Not recorded");
        }

        setFormData((prev) => ({
          ...prev,
          end_time: getCurrentDateTime(),
          technician_id:
            !data.technician_id && user
              ? user.employee_id
              : data.technician_id || "",
        }));
      } catch (error) {
        console.error("Error loading downtime detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDowntimeDetail();
  }, [id, getAuthHeader, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleImageChange = (file) => {
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // เปลี่ยนชื่อฟิลด์ solution_description เป็น action_description ในการตรวจสอบ
    const validationData = {
      ...formData,
      action_description: formData.solution_description,
    };

    const validation = validateResolutionForm(validationData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload image if present
      let imageAfterRepair = null;
      if (image) {
        const formDataImg = new FormData();
        formDataImg.append("file", image);

        try {
          const imageResponse = await fetch("/api/upload/single", {
            method: "POST",
            headers: {
              ...getAuthHeader(),
            },
            body: formDataImg,
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            imageAfterRepair = imageData.filePath;
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }

      // 2. Resolve the downtime
      const resolveData = {
        solution_description: formData.solution_description, // ส่งไปยัง API ชื่อเดิม
        technician_id: formData.technician_id,
        end_time: new Date(formData.end_time).toISOString(),
        image_after_repair: imageAfterRepair,
        status: "waiting_leader_approval",
      };

      // เรียกใช้ resolveDowntime เพื่อบันทึกรายละเอียดการซ่อม
      await resolveDowntime(id, resolveData, getAuthHeader());

      // อัพเดทสถานะเครื่องจักรเป็น waiting_leader_approval
      await updateMachineStatus(
        downtimeData.machine_id,
        "waiting_leader_approval",
        formData.technician_id
      );

      // 3. Refresh dashboard data
      try {
        await fetch(
          "/api/status-machine/dashboard/summary?refresh=true&t=" +
            new Date().getTime()
        );
      } catch (refreshError) {
        console.error("Error refreshing dashboard data:", refreshError);
      }

      // 4. แสดงข้อความสำเร็จและนำทางไปยังหน้ารายละเอียด
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Repair has been completed and submitted for approval",
        confirmButtonText: "OK",
        timer: 1500,
      }).then(() => {
        router.push(`/main-menu/status-machine-dashboard`);
      });
    } catch (error) {
      console.error("Error resolving downtime:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error resolving downtime: " + (error.message || "Unknown error"),
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardClass = `p-6 rounded-lg shadow-md ${
    darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
  }`;

  const inputClass = `w-full p-2.5 border rounded-lg ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900"
  } focus:ring-2 focus:outline-none ${
    darkMode
      ? "focus:ring-blue-500 focus:border-blue-500"
      : "focus:ring-blue-500 focus:border-blue-500"
  }`;

  const infoBoxClass = `p-2.5 rounded-lg ${
    darkMode ? "bg-gray-700" : "bg-gray-100"
  }`;

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} p-8`}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className={`rounded-full p-2 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2
              className={`text-3xl font-extrabold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Resolve Machine Downtime
            </h2>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Content */}
        {!isLoading && downtimeData && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Machine & Issue Info */}
            <div className={cardClass}>
              <div className="flex items-center mb-4">
                <AlertTriangle
                  className={`h-5 w-5 mr-2 ${
                    darkMode ? "text-red-400" : "text-red-500"
                  }`}
                />
                <h3
                  className={`text-lg font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Issue Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Machine Name */}
                <div>
                  <p
                    className={`text-sm font-medium mb-1 flex items-center ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <Wrench className="h-4 w-4 mr-2 text-blue-500" />
                    Machine Name
                  </p>
                  <div className={infoBoxClass}>
                    <div className="flex items-center">
                      <Wrench className="h-4 w-4 mr-2" />
                      {downtimeData.machine_name}
                    </div>
                  </div>
                </div>

                {/* Machine Number */}
                <div>
                  <p
                    className={`text-sm font-medium mb-1 flex items-center ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <Hash className="h-4 w-4 mr-2 text-green-500" />
                    Machine Number
                  </p>
                  <div className={infoBoxClass}>
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      {downtimeData.machine_number}
                    </div>
                  </div>
                </div>

                {/* Problem Type */}
                <div>
                  <p
                    className={`text-sm font-medium mb-1 flex items-center ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                    Problem Type
                  </p>
                  <div className={infoBoxClass}>
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {downtimeData.problem_type || "Not specified"}
                    </div>
                  </div>
                </div>

                {/* Start Time Machine Downtime */}
                <div>
                  <p
                    className={`text-sm font-medium mb-1 flex items-center ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <Clock className="h-4 w-4 mr-2 text-orange-500" />
                    Start Time Machine Downtime
                  </p>
                  <div className={infoBoxClass}>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatLongDateTime(downtimeData.start_time)}
                    </div>
                  </div>
                </div>

                {/* Problem Description */}
                <div>
                  <p
                    className={`text-sm font-medium mb-1 flex items-center ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                    Problem Description
                  </p>
                  <div className={infoBoxClass}>
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {downtimeData.problem_description}
                    </div>
                  </div>
                </div>

                {/* Start Time Under Maintenance */}
                <div>
                  <p
                    className={`text-sm font-medium mb-1 flex items-center ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <Clock className="h-4 w-4 mr-2 text-purple-500" />
                    Start Time Under Maintenance
                  </p>
                  <div className={infoBoxClass}>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatLongDateTime(maintenanceStartTime)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Action */}
            <div className={cardClass}>
              <div className="flex items-center mb-4">
                <Wrench
                  className={`h-5 w-5 mr-2 ${
                    darkMode ? "text-blue-400" : "text-blue-500"
                  }`}
                />
                <h3
                  className={`text-lg font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Maintenance Action
                </h3>
              </div>

              <div className="space-y-4">
                {/* เปลี่ยนชื่อฟิลด์จาก Solution Description เป็น Action Description */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Action Description *
                  </label>
                  <textarea
                    name="solution_description" // ยังคงใช้ชื่อเดิมสำหรับ state
                    value={formData.solution_description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className={`${inputClass} ${
                      formErrors.solution_description ? "border-red-500" : ""
                    }`}
                    placeholder="Describe what actions were taken to resolve the issue"
                  />
                  {formErrors.solution_description && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.solution_description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Technician ID *
                    </label>
                    <input
                      type="text"
                      name="technician_id"
                      value={formData.technician_id}
                      onChange={(e) => {
                        const value = handleNumericIdInput(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          technician_id: value,
                        }));

                        // Clear error for this field
                        if (formErrors.technician_id) {
                          setFormErrors((prev) => ({
                            ...prev,
                            technician_id: null,
                          }));
                        }
                      }}
                      onKeyPress={(e) => {
                        // Prevent non-numeric characters
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      maxLength={6}
                      className={`${inputClass} ${
                        formErrors.technician_id ? "border-red-500" : ""
                      }`}
                      placeholder="Employee ID of technician"
                    />

                    {formData.technician_id.length > 0 &&
                      formData.technician_id.length < 6 && (
                        <p className="mt-2 text-sm text-red-500">
                          Please enter a 6-digit technician ID.
                        </p>
                      )}

                    {formData.technician_id.length === 6 && (
                      <p className="mt-2 text-sm text-green-500">
                        Technician ID is complete with 6 digits.
                      </p>
                    )}

                    {formErrors.technician_id && (
                      <p className="mt-2 text-sm text-red-500">
                        {formErrors.technician_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      End Time *
                    </label>
                    <div className="flex">
                      <input
                        type="datetime-local"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleInputChange}
                        required
                        className={`${inputClass} ${
                          formErrors.end_time ? "border-red-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const localISOTime =
                            now.getFullYear() +
                            "-" +
                            String(now.getMonth() + 1).padStart(2, "0") +
                            "-" +
                            String(now.getDate()).padStart(2, "0") +
                            "T" +
                            String(now.getHours()).padStart(2, "0") +
                            ":" +
                            String(now.getMinutes()).padStart(2, "0");

                          setFormData((prev) => ({
                            ...prev,
                            end_time: localISOTime,
                          }));
                        }}
                        className="ml-2 p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        title="Set to current time"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                    </div>
                    {formErrors.end_time && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.end_time}
                      </p>
                    )}
                  </div>
                </div>

                <div className="hidden">
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    After-repair Image
                  </label>
                  <ImageUploader
                    onImageChange={handleImageChange}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className={`hidden px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } flex items-center`}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={`px-6 py-2 rounded-lg ${
                  darkMode
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-500 hover:bg-green-600"
                } text-white flex items-center space-x-2`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Mark as Resolved</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Not Found */}
        {!isLoading && !downtimeData && (
          <div className={`${cardClass} p-12 text-center`}>
            <XCircle
              className={`h-16 w-16 mx-auto mb-4 ${
                darkMode ? "text-red-400" : "text-red-500"
              }`}
            />
            <h3 className="text-xl font-bold mb-2">Record Not Found</h3>
            <p
              className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              The downtime record you are looking for doesn't exist or you don't
              have permission to view it.
            </p>
            <button
              onClick={() => router.push("/main-menu/machinedown-logs")}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              Back to Logs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
