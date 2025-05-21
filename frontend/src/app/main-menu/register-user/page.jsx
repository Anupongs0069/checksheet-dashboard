// ./src/app/main-menu/register-user/page.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { useDarkMode } from "../../components/DarkModeProvider";
import RegisterUsersForm from "../../components/auth/RegisterUsersForm";
// import bcrypt from 'bcryptjs';

function RegisterUsersPage() {
  const { darkMode } = useDarkMode();
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    /*
    const [availableRoles, setAvailableRoles] = useState([1, 2, 3, 4, 5, 6]);
    const [selectedRole, setSelectedRole] = useState(1);
  */

    employee_id: "",
    email: "",
    phone_number: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    console.log("Current user state:", user);
    console.log("Auth loading state:", authLoading);
    console.log(
      "Local storage user:",
      localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null
    );

    if (authLoading) {
      console.log("Auth context is still loading...");
      return;
    }

    if (!user) {
      console.log("No user found, redirecting to login");
      router.push("/main-menu/login");
      return;
    }

    console.log("User role:", user.role);

    switch (user.role) {
      case 4:
        setAvailableRoles([1, 2]);
        setSelectedRole(1);
        break;
      case 5:
        setAvailableRoles([3]);
        setSelectedRole(3);
        break;
      case 6:
        setAvailableRoles([1, 2, 3, 4, 5, 6]);
        setSelectedRole(1);
        break;
      default:
        console.log("User has invalid role:", user.role);
        router.push("/main-menu");
        return;
    }
    setPageLoading(false);
  }, [user, router, authLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // เพิ่ม token ใน headers
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        "/api/user-management/register",
        {
          ...formData,
          role: selectedRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log("User registered:", response.data);
      
      await Swal.fire({
        position: "center",
        icon: "success",
        title: "Registration Successful",
        text: "The user account has been created successfully.",
        showConfirmButton: false,
        timer: 1500,
      });
      
      router.push("/main-menu");
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      
      setError(
        error.response?.data?.message ||
        "An error occurred during registration."
      );
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "An error occurred during registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRoleChange = (event) => {
    setSelectedRole(Number(event.target.value));
  };

  if (pageLoading || authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (availableRoles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">No roles available for your account.</div>
          <button
            onClick={() => router.push("/main-menu")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Main Menu
          </button>
        </div>
      </div>
    );
  }

  const fields = [
    {
      id: "employee-no",
      name: "employee_id",
      type: "text",
      placeholder: "Employee ID",
      required: true,
    },
    {
      id: "email",
      name: "email",
      type: "email",
      placeholder: "Email",
      required: selectedRole !== 1,
    },
    {
      id: "phone",
      name: "phone_number",
      type: "text",
      placeholder: "Internal Phone",
      required: selectedRole !== 1,
    },
    {
      id: "firstname",
      name: "first_name",
      type: "text",
      placeholder: "First Name",
      required: true,
    },
    {
      id: "lastname",
      name: "last_name",
      type: "text",
      placeholder: "Last Name",
      required: true,
    },
    {
      id: "password",
      name: "password",
      type: "password",
      placeholder: "Password",
      required: true,
    },
    {
      id: "confirm-password",
      name: "confirm_password",
      type: "password",
      placeholder: "Confirm Password",
      required: true,
    },
  ];

  const validateForm = () => {
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.employee_id.length < 6) {
      setError("Employee ID must be at least 6 characters long");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (selectedRole !== 1 && !formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } py-8 px-4`}
    >
      <div
        className={`max-w-xl mx-auto ${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-2xl shadow-lg`}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-3xl font-extrabold">Register</h2>
        </div>

        <RegisterUsersForm
          formData={formData}
          handleInputChange={handleInputChange}
          selectedRole={selectedRole}
          handleRoleChange={handleRoleChange}
          availableRoles={availableRoles}
          error={error}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

export default RegisterUsersPage;
