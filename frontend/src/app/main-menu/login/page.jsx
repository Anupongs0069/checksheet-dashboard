// ./src/app/main-menu/login/page.jsx

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDarkMode } from "../../components/DarkModeProvider";
import { useAuth } from "../../../contexts/AuthContext";
import { Sun, Moon } from "lucide-react";
import Swal from "sweetalert2";
import LoginForm from "../../components/auth/LoginForm";

function LogInPage() {
  const { darkMode, setDarkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/login-user", credentials);
      console.log("Login response:", response.data);
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid response format");
      }

      login(token, user);

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome to the system",
        timer: 1500,
        showConfirmButton: false,
        willClose: () => {
          window.location.href = "/main-menu";
        }
      });
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Error during login";
      if (err.response) {
        errorMessage = err.response.data.message || "Invalid employee ID or password";
      } else if (err.request) {
        errorMessage = "Could not connect to the server. Please try again.";
      }
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = "/main-menu"; 
    }
  }, [router]);

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="space-y-10 bg-background text-foreground p-10 rounded-3xl shadow-2xl transition-colors duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold">Login</h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode
                ? "bg-gray-700 text-yellow-300"
                : "bg-gray-200 text-gray-700"
              }`}
          >
            {darkMode ? (
              <Sun className="h-6 w-6" />
            ) : (
              <Moon className="h-6 w-6" />
            )}
          </button>
        </div>
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default LogInPage;