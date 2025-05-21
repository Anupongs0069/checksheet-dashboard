// ./src/app/components/auth/RegisterUsersForm.jsx

"use client";

import React from "react";
import {
  UserPlus,
  User,
  Phone,
  AtSign,
  ShieldCheck,
  Key,
  KeyRound,
  Tag,
  BadgeCheck,
} from "lucide-react";

const roleLabels = {
  1: "Operator",
  2: "Production Leader",
  3: "Technician",
  4: "Production Supervisor",
  5: "Technical Supervisor",
  6: "Admin",
};

const RoleIcon = ({ role }) => {
  switch (role) {
    case 1:
      return <User className="h-4 w-4 text-blue-500" />;
    case 2:
      return <BadgeCheck className="h-4 w-4 text-green-500" />;
    case 3:
      return <Tag className="h-4 w-4 text-amber-500" />;
    case 4:
      return <ShieldCheck className="h-4 w-4 text-purple-500" />;
    case 5:
      return <ShieldCheck className="h-4 w-4 text-red-500" />;
    case 6:
      return <ShieldCheck className="h-4 w-4 text-indigo-500" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const RegisterUsersForm = ({
  formData,
  handleInputChange,
  selectedRole,
  handleRoleChange,
  availableRoles,
  error,
  isLoading,
  handleSubmit,
  darkMode,
}) => {
  const labelClass = `block text-sm font-medium mb-1 ${
    darkMode ? "text-gray-300" : "text-gray-700"
  }`;

  const inputClass = `w-full p-2.5 pl-10 border rounded-lg ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900"
  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {/* Role Select */}
      <div className="relative mb-2">
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="h-4 w-4 text-blue-500" />
            Access Level
          </span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {selectedRole && <RoleIcon role={selectedRole} />}
          </div>
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            className={inputClass}
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role] || "Unknown"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Fields - 2 columns grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="relative">
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-blue-500" />
              Employee ID
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Tag className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              required
              className={inputClass}
              placeholder="Enter employee ID"
            />
          </div>
        </div>

        <div className="relative">
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-blue-500" />
              Internal Phone
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Phone className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              required={selectedRole !== 1}
              className={inputClass}
              placeholder="Enter internal phone"
            />
          </div>
        </div>

        <div className="relative">
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-blue-500" />
              First Name
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
              className={inputClass}
              placeholder="Enter first name"
            />
          </div>
        </div>

        <div className="relative">
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-blue-500" />
              Last Name
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              required
              className={inputClass}
              placeholder="Enter last name"
            />
          </div>
        </div>
      </div>

      {/* Single Column for Email */}
      <div className="relative">
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            <AtSign className="h-4 w-4 text-blue-500" />
            Email
          </span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <AtSign className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required={selectedRole !== 1}
            className={inputClass}
            placeholder="Enter email address"
          />
        </div>
      </div>

      {/* Password Fields - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="relative">
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <Key className="h-4 w-4 text-blue-500" />
              Password
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Key className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={inputClass}
              placeholder="Enter password"
            />
          </div>
        </div>

        <div className="relative">
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <KeyRound className="h-4 w-4 text-blue-500" />
              Confirm Password
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <KeyRound className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              required
              className={inputClass}
              placeholder="Confirm password"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className={`px-4 py-3 rounded relative ${
            darkMode ? "bg-red-900/30" : "bg-red-100"
          }`}
          role="alert"
        >
          <div className="flex items-center">
            <svg
              className={`w-5 h-5 mr-2 ${
                darkMode ? "text-red-400" : "text-red-500"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span
              className={`block sm:inline ${
                darkMode ? "text-red-400" : "text-red-700"
              }`}
            >
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 text-white font-medium
                  transition-all duration-200 transform hover:translate-y-[-2px]
                  ${
                    isLoading
                      ? "bg-gray-500 cursor-not-allowed"
                      : `bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                       shadow-lg hover:shadow-blue-500/30`
                  }`}
      >
        <UserPlus size={20} />
        {isLoading ? "Registering..." : "Register User"}
      </button>
    </form>
  );
};

export default RegisterUsersForm;
