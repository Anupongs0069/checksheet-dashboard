// ./src/app/components/MachineDownDashboard/pages/AssignForm.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Clipboard,
  User,
  MessageSquare,
} from "lucide-react";
import Swal from "sweetalert2";

import {
  fetchDowntimeDetail as fetchDowntimeById,
  updateMachineStatus,
} from "../utils/apiUtils";

import { validateAssignmentForm } from "../utils/validationUtils";

const handleNumericIdInput = (value, maxLength = 6) => {
  return value.replace(/\D/g, "").slice(0, maxLength);
};

export default function AssignForm({ id }) {
  const router = useRouter();
  const { user, getAuthHeader } = useAuth();
  const { darkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downtimeData, setDowntimeData] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    technician_id: "",
    technician_name: "",
    assignment_notes: "",
  });

  useEffect(() => {
    const loadDowntimeDetail = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await fetchDowntimeById(id, getAuthHeader());
        setDowntimeData(data);
        console.log("Downtime detail data:", data);

        if (user) {
          setFormData((prev) => ({
            ...prev,
            technician_id: user.employee_id || "",
            technician_name: user.name || "",
          }));
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.technician_id) {
      setFormErrors({
        technician_id: "Technician ID is required",
      });
      return;
    } else if (formData.technician_id.length !== 6) {
      setFormErrors({
        technician_id: "Technician ID must be 6 digits",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const assignData = {
        technician_id: formData.technician_id,
        technician_name: formData.technician_name || "Auto-assigned", // ใช้ค่าเริ่มต้นถ้าไม่มีชื่อ
        assignment_notes: formData.assignment_notes || "",
        status: "maintenance",
      };

      // อัปเดตสถานะเครื่อง
      await updateMachineStatus(
        downtimeData.machine_id,
        "maintenance",
        formData.technician_id
      );

      // แสดง Sweetalert แจ้งเตือนเมื่อสำเร็จ
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: `You have accepted repair job for ${downtimeData.machine_name}.`,
        confirmButtonText: "OK",
        timer: 1500,
      });

      // นำกลับไปที่หน้าหลัก
      router.push(`/main-menu`);
    } catch (error) {
      console.error("Error assigning downtime:", error);

      // แสดง Sweetalert แจ้งเตือนเมื่อเกิดข้อผิดพลาด
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to accept repair job: ${
          error.message || "Unknown error"
        }`,
        confirmButtonText: "Try Again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced styles with more visual appeal
  const cardClass = `p-6 rounded-xl shadow-lg border ${
    darkMode
      ? "bg-gray-800 text-white border-gray-700"
      : "bg-white text-gray-900 border-gray-100"
  } transition-all duration-300`;

  const sectionHeaderClass = `flex items-center mb-6 pb-3 border-b ${
    darkMode ? "border-gray-700" : "border-gray-200"
  }`;

  const inputClass = `w-full p-3 border rounded-lg transition-colors duration-200 ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900"
  } focus:ring-2 focus:outline-none ${
    darkMode
      ? "focus:ring-blue-500 focus:border-blue-500"
      : "focus:ring-blue-500 focus:border-blue-500"
  }`;

  const infoBoxClass = `p-3 rounded-lg flex items-center ${
    darkMode ? "bg-gray-700" : "bg-gray-100"
  }`;

  const iconBoxClass = `p-2 rounded-full mr-3 flex items-center justify-center`;

  // Icon colors based on section
  const alertIconColor = darkMode ? "text-orange-400" : "text-orange-500";
  const machineIconColor = darkMode ? "text-blue-400" : "text-blue-600";
  const issueIconColor = darkMode ? "text-red-400" : "text-red-500";
  const timeIconColor = darkMode ? "text-purple-400" : "text-purple-600";
  const techIconColor = darkMode ? "text-green-400" : "text-green-600";
  const descIconColor = darkMode ? "text-amber-400" : "text-amber-600";

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      } p-4 md:p-8`}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className={`rounded-full p-2.5 transition-colors duration-200 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2
              className={`text-2xl md:text-3xl font-extrabold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Accept Repair Job
            </h2>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Content */}
        {!isLoading && downtimeData && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Machine & Issue Info */}
            <div className={cardClass}>
              <div className={sectionHeaderClass}>
                <div
                  className={`${iconBoxClass} ${
                    darkMode ? "bg-red-900/30" : "bg-red-100"
                  }`}
                >
                  <AlertTriangle className={`h-6 w-6 ${issueIconColor}`} />
                </div>
                <h3
                  className={`text-xl font-bold ${
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
                    className={`text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Machine Name
                  </p>
                  <div className={infoBoxClass}>
                    <Wrench className={`h-5 w-5 mr-3 ${machineIconColor}`} />
                    <span className="font-medium">
                      {downtimeData.machine_name}
                    </span>
                  </div>
                </div>

                {/* Machine Number */}
                <div>
                  <p
                    className={`text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Machine Number
                  </p>
                  <div className={infoBoxClass}>
                    <Hash className={`h-5 w-5 mr-3 ${machineIconColor}`} />
                    <span className="font-medium">
                      {downtimeData.machine_number}
                    </span>
                  </div>
                </div>

                {/* Problem Type */}
                <div>
                  <p
                    className={`text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Problem Type
                  </p>
                  <div className={infoBoxClass}>
                    <AlertTriangle
                      className={`h-5 w-5 mr-3 ${alertIconColor}`}
                    />
                    <span className="font-medium">
                      {downtimeData.problem_type || "Not specified"}
                    </span>
                  </div>
                </div>

                {/* Start Time */}
                <div>
                  <p
                    className={`text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Start Time
                  </p>
                  <div className={infoBoxClass}>
                    <Clock className={`h-5 w-5 mr-3 ${timeIconColor}`} />
                    <span className="font-medium">
                      {new Date(downtimeData.start_time).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <p
                  className={`text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Problem Description
                </p>
                <div
                  className={`p-4 rounded-lg flex ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <MessageSquare
                    className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${descIconColor}`}
                  />
                  <span className="whitespace-pre-line">
                    {downtimeData.problem_description}
                  </span>
                </div>
              </div>
            </div>

            {/* Assignment Form */}
            <div className={cardClass}>
              <div className={sectionHeaderClass}>
                <div
                  className={`${iconBoxClass} ${
                    darkMode ? "bg-green-900/30" : "bg-green-100"
                  }`}
                >
                  <User className={`h-6 w-6 ${techIconColor}`} />
                </div>
                <h3
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Assignment Details
                </h3>
              </div>

              {/* Technician ID */}
              <div className="mb-4">
                <label
                  className={`block mb-2 text-sm font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Technician ID *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Clipboard className={`h-5 w-5 ${techIconColor}`} />
                  </div>
                  <input
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
                    placeholder="Enter your technician ID"
                    className={`${inputClass} pl-12 ${
                      formErrors.technician_id ? "border-red-500" : ""
                    }`}
                  />
                </div>

                {formData.technician_id.length > 0 &&
                  formData.technician_id.length < 6 && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Please enter a 6-digit technician ID.
                    </p>
                  )}

                {formData.technician_id.length === 6 && (
                  <p className="mt-2 text-sm text-green-500 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Technician ID is complete with 6 digits.
                  </p>
                )}

                {formErrors.technician_id && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <XCircle className="h-4 w-4 mr-2" />
                    {formErrors.technician_id}
                  </p>
                )}
              </div>

              {/* Technician Name Field */}
              <div className="hidden mb-4">
                <label
                  className={`block mb-2 text-sm font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Technician Name
                </label>
                <input
                  name="technician_name"
                  value={formData.technician_name}
                  onChange={handleInputChange}
                  placeholder="Enter your name (optional)"
                  className={inputClass}
                />
              </div>

              {/* Assignment Notes */}
              <div className="hidden mb-4">
                <label
                  className={`block mb-2 text-sm font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Notes (Optional)
                </label>
                <textarea
                  name="assignment_notes"
                  value={formData.assignment_notes}
                  onChange={handleInputChange}
                  placeholder="Add any notes about this assignment"
                  className={`${inputClass} min-h-[100px]`}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className={`hidden px-5 py-2.5 rounded-lg transition-colors duration-200 font-medium ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                } flex items-center`}
                disabled={isSubmitting}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Cancel
              </button>

              <button
                type="submit"
                className={`px-6 py-2.5 rounded-lg transition-colors duration-200 font-medium ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white flex items-center space-x-2`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    <span>Accept Job</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Not Found */}
        {!isLoading && !downtimeData && (
          <div className={`${cardClass} p-12 text-center`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
              <XCircle
                className={`h-10 w-10 ${
                  darkMode ? "text-red-400" : "text-red-500"
                }`}
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Record Not Found</h3>
            <p
              className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              The downtime record you are looking for doesn't exist or you don't
              have permission to view it.
            </p>
            <button
              onClick={() => router.push("/main-menu/status-machine-dashboard")}
              className={`px-5 py-2.5 rounded-lg transition-colors duration-200 font-medium ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white flex items-center mx-auto`}
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
