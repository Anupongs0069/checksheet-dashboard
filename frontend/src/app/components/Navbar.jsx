// ./src/app/components/Navbar.jsx

"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Sun, Moon, LogOut } from "lucide-react";
import { useDarkMode } from "@/app/components/DarkModeProvider";
import { useAuth } from "@/contexts/AuthContext";
import Swal from "sweetalert2";

const Navbar = () => {
  const { darkMode, setDarkMode } = useDarkMode();
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, logout, checkLoginStatus } = useAuth();

  useEffect(() => {
    if (pathname) {
      checkLoginStatus();
    }
  }, [pathname]);

  const handleLogout = () => {
    Swal.fire({
      title: "Log Out",
      text: "Do you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        window.location.href = "/";
        Swal.fire(
          "You have logged out!",
          "You have successfully logged out.",
          "success"
        );
      }
    });
  };

  const handleMachineDownClick = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || ![3, 5, 6].includes(user?.role)) {
      const { value: password } = await Swal.fire({
        title: "Please enter your password.",
        input: "password",
        inputLabel: "Password",
        inputPlaceholder: "Enter your password",
        inputAttributes: {
          maxlength: "10",
          autocapitalize: "off",
          autocorrect: "off",
        },
      });
      if (password === "424" || password === "123") {
        window.location.href = "/main-menu/machinedown-dashdoard";
      } else {
        Swal.fire({
          icon: "error",
          title: "Incorrect Password",
          text: "Please try again.",
        });
      }
    } else {
      window.location.href = "/main-menu/machinedown-dashdoard";
    }
  };

  return (
    <nav
      className={`w-full p-4 ${
        darkMode ? "bg-gray-800" : "bg-white"
      } transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          <Link href="/main-menu">Menu</Link>
        </div>
        <ul className="flex space-x-6 items-center">
          <li>
            <Link
              href="/main-menu/status-machine-dashboard/tv-display"
              className={`${
                darkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Status Dashboard
            </Link>
          </li>
          <li className="hidden">
            <Link
              href="#"
              className={`${
                darkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={handleMachineDownClick}
            >
              Downtime
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className={`${
                darkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={handleMachineDownClick}
            >
              Record
            </Link>
          </li>
          {isLoggedIn && (
            <li>
              <button
                onClick={handleLogout}
                className={`flex items-center ${
                  darkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <LogOut className="h-5 w-5 mr-1" />
                Log Out
              </button>
            </li>
          )}
          <li>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode
                  ? "bg-gray-700 text-yellow-300"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
