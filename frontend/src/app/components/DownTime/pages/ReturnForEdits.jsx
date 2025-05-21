// ./src/app/components/DownTime/pages/ReturnForEdits.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useAuth } from "@/contexts/AuthContext";
import { useDarkMode } from "@/app/components/DarkModeProvider";
import {
  AlertTriangle,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  MoveLeft,
  BadgeAlert,
  Pencil,
  Tag,
  Settings,
  Info,
  Shield,
} from "lucide-react";

import {
  fetchDowntimeDetail,
  returnDowntimeForEdits, 
} from "../utils/apiUtils";

export default function ReturnForEdits({ id }) {
  const router = useRouter();
  const { user, getAuthHeader } = useAuth();
  const { darkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downtimeData, setDowntimeData] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    return_reason: "",
    leader_id: "",
    leader_name: "",
  });

  useEffect(() => {
    const loadDowntimeDetail = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await fetchDowntimeDetail(id, getAuthHeader());
        setDowntimeData(data);
        console.log("Downtime detail data:", data);

        // Pre-fill leader field if user is logged in
        if (user) {
          setFormData((prev) => ({
            ...prev,
            leader_id: user.employee_id || "",
            leader_name: user.name || "",
          }));
        }
      } catch (error) {
        console.error("Error loading downtime detail:", error);
        
        Swal.fire({
          icon: "error",
          title: "Error Loading Data",
          text: "Could not load the required information. Please try again later.",
        });
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

    // Validate form data
    const errors = {};
    if (!formData.return_reason.trim()) {
      errors.return_reason = "Please provide a reason for returning this report";
    }

    if (!formData.leader_id) {
      errors.leader_id = "Leader ID is required";
    } else if (formData.leader_id.length !== 6) {
      errors.leader_id = "Leader ID must be 6 digits";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const returnData = {
        return_reason: formData.return_reason,
        leader_id: formData.leader_id,
        leader_name: formData.leader_name || "Anonymous Leader",
        status: "active",
        returned_at: new Date().toISOString(),
      };

      await returnDowntimeForEdits(
        downtimeData.machine_id || id, 
        returnData,
        getAuthHeader()
      );

      // 3. Show success message
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "The repair report has been returned to the technician for edits",
        confirmButtonText: "OK",
        timer: 2000,
      });

      // 4. Navigate back to dashboard
      router.push("/main-menu/status-machine-dashboard");
    } catch (error) {
      console.error("Error returning downtime:", error);
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to return report: ${error.message || "Unknown error"}`,
        confirmButtonText: "Try Again",
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

  // ฟังก์ชันสำหรับจัดการข้อมูลที่เป็นตัวเลขเท่านั้น
  const handleNumericIdInput = (value, maxLength = 6) => {
    // รับเฉพาะตัวเลขและจำกัดความยาว
    return value.replace(/\D/g, '').slice(0, maxLength);
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} p-8`}
    >
      <div className="max-w-4xl mx-auto space-y-8">
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
              <span className="flex items-center">
                <MoveLeft className="mr-3 h-7 w-7 text-amber-500" />
                Return for Edits
              </span>
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
              <div className="flex items-center mb-5 pb-2 border-b border-gray-700">
                <Info
                  className="h-6 w-6 mr-3 text-blue-500"
                />
                <h3
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Report Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Machine Name */}
                <div className="bg-opacity-50 p-4 rounded-lg border border-gray-700 transition-all hover:border-blue-500">
                  <div className="flex items-center mb-2">
                    <Settings className="h-5 w-5 mr-2 text-blue-500" />
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-blue-300" : "text-blue-700"
                      }`}
                    >
                      Machine Name
                    </p>
                  </div>
                  <div className={`${infoBoxClass} bg-opacity-70`}>
                    <div className="flex items-center font-medium text-lg">
                      {downtimeData.machine_name || downtimeData.machine_full_name || "Unknown Machine"}
                    </div>
                  </div>
                </div>

                {/* Machine Number */}
                <div className="bg-opacity-50 p-4 rounded-lg border border-gray-700 transition-all hover:border-green-500">
                  <div className="flex items-center mb-2">
                    <Tag className="h-5 w-5 mr-2 text-green-500" />
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-green-300" : "text-green-700"
                      }`}
                    >
                      Machine Number
                    </p>
                  </div>
                  <div className={`${infoBoxClass} bg-opacity-70`}>
                    <div className="flex items-center font-medium text-lg">
                      {downtimeData.machine_number || "Not available"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Return for Edits Form */}
            <div className={cardClass}>
              <div className="flex items-center mb-5 pb-2 border-b border-gray-700">
                <Pencil
                  className="h-6 w-6 mr-3 text-amber-500"
                />
                <h3
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Return for Edits
                </h3>
              </div>

              {/* Return Reason Field */}
              <div className="mb-6 bg-opacity-50 p-4 rounded-lg border border-gray-700 transition-all hover:border-amber-500">
                <div className="flex items-center mb-2">
                  <BadgeAlert className="h-5 w-5 mr-2 text-amber-500" />
                  <label 
                    className={`text-sm font-medium ${
                      darkMode ? "text-amber-300" : "text-amber-700"
                    }`}
                  >
                    Reason for Return *
                  </label>
                </div>
                <textarea
                  name="return_reason"
                  value={formData.return_reason}
                  onChange={handleInputChange}
                  placeholder="Please explain why this report needs revisions"
                  rows={5}
                  className={`${inputClass} ${
                    formErrors.return_reason ? "border-red-500" : ""
                  }`}
                />
                
                {formErrors.return_reason && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formErrors.return_reason}
                  </p>
                )}
              </div>
              
              {/* Leader ID Field */}
              <div className="mb-6 bg-opacity-50 p-4 rounded-lg border border-gray-700 transition-all hover:border-purple-500">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 mr-2 text-purple-500" />
                  <label 
                    className={`text-sm font-medium ${
                      darkMode ? "text-purple-300" : "text-purple-700"
                    }`}
                  >
                    Leader ID *
                  </label>
                </div>
                <input
                  name="leader_id"
                  value={formData.leader_id}
                  onChange={(e) => {
                    const value = handleNumericIdInput(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      leader_id: value
                    }));
                    
                    // Clear error for this field
                    if (formErrors.leader_id) {
                      setFormErrors(prev => ({
                        ...prev,
                        leader_id: null
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
                  placeholder="Please enter your leader ID."
                  className={`${inputClass} ${
                    formErrors.leader_id ? "border-red-500" : ""
                  }`}
                />
                
                {formData.leader_id.length > 0 && formData.leader_id.length < 6 && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Please enter a 6-digit leader ID.
                  </p>
                )}
                
                {formData.leader_id.length === 6 && (
                  <p className="mt-2 text-sm text-green-500 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Leader ID is complete with 6 digits.
                  </p>
                )}
                
                {formErrors.leader_id && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formErrors.leader_id}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className={`hidden px-4 py-2.5 rounded-lg ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-300 hover:bg-gray-400"
                } flex items-center font-medium transition-colors`}
                disabled={isSubmitting}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Cancel
              </button>

              <button
                type="submit"
                className={`px-6 py-2.5 rounded-lg ${
                  darkMode
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-amber-500 hover:bg-amber-600"
                } text-white flex items-center space-x-2 font-medium transition-colors`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="h-5 w-5 mr-2" />
                    <span>Return for Edits</span>
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
              The machine record you are looking for doesn't exist or you don't
              have permission to view it.
            </p>
            <button
              onClick={() => router.push("/main-menu/status-machine-dashboard")}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}