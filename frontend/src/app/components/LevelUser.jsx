// ./src/app/components/LevelUser.jsx

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  AlertTriangle,
  FileText,
  Activity,
  Settings,
  BarChart2,
  Users,
  User,
  PauseCircle,
  Trash2,
  LogIn,
  ShieldPlus,
  ShieldCheck,
  ChevronRight,
  HardDrive,
  PlusCircle,
  Settings2,
  Award,
  Sliders,
  FileCheck,
} from "lucide-react";
import { useDarkMode } from "@/app/components/DarkModeProvider";
import { useAuth } from "../../contexts/AuthContext";

function LevelUser({ userRole: initialUserRole }) {
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState(initialUserRole);

  useEffect(() => {
    if (!user) {
      setCurrentRole(0);
    } else {
      setCurrentRole(initialUserRole);
    }
  }, [user, initialUserRole]);

  const handleButtonClick = (path) => {
    console.log(`Navigating to: /main-menu/${path}`);
    router.push(`/main-menu/${path}`);
  };

  const getIcon = (path) => {
    switch (path) {
      case "daily-machine-check":
        return <CheckSquare className="h-6 w-6 text-blue-500" />;
      case "check-parameters":
        return <Settings2 className="h-6 w-6 text-blue-500" />;
      case "machine-downtime":
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case "work-instruction":
        return <FileText className="h-6 w-6 text-indigo-500" />;
      case "log-dailymachine":
        return <Activity className="h-6 w-6 text-green-500" />;
      case "status-machine-dashboard":
        return <Settings className="h-6 w-6 text-amber-500" />;
      case "output-dashboard":
        return <BarChart2 className="h-6 w-6 text-purple-500" />;
      case "register-user":
        return <Users className="h-6 w-6 text-blue-600" />;
      case "user-profile":
        return <User className="h-6 w-6 text-cyan-500" />;
      case "machinedown-dashdoard":
        return <PauseCircle className="h-6 w-6 text-red-600" />;
      case "delete-user":
        return <Trash2 className="h-6 w-6 text-red-500" />;
      case "login":
        return <LogIn className="h-6 w-6 text-green-600" />;
      case "daily-safety-check":
        return <ShieldPlus className="h-6 w-6 text-yellow-500" />;
      case "log-safetycheck":
        return <ShieldCheck className="h-6 w-6 text-yellow-600" />;
      case "machine-management":
        return <HardDrive className="h-6 w-6 text-slate-500" />;
      case "add-machine":
        return <PlusCircle className="h-6 w-6 text-green-500" />;
      case "machinedown-dashdoard":
        return <PauseCircle className="h-6 w-6 text-red-600" />;
      case "check-quality":
        return <Award className="h-6 w-6 text-yellow-500" />;
      case "log-parameters":
        return <Sliders className="h-6 w-6 text-blue-500" />;
      case "log-quality":
        return <FileCheck className="h-6 w-6 text-green-500" />;
      default:
        return <ChevronRight className="h-6 w-6 text-gray-400" />;
    }
  };

  const menuItems = {
    0: [
      { title: "Machine Safety Check", path: "daily-safety-check" },
      { title: "Quality Inspection", path: "check-quality" },
      { title: "Machine Down", path: "machine-downtime" },
      { title: "Work Instruction", path: "work-instruction" },
      { title: "Log Safety Check", path: "log-safetycheck" },
      { title: "Log Quality", path: "log-quality" },
      //  { title: "Machine Daily Check", path: "daily-machine-check" },
      //  { title: "Log Daily Machine", path: "log-dailymachine" },
      //  { title: "Machine Parameter Inspection", path: "check-parameters" },
      //  { title: "Log Parameters", path: "log-parameters" },
      //  { title: "Dashboard Status Machine", path: "status-machine-dashboard" },
      { title: "Log In", path: "login" },
    ],
    1: [
      { title: "Machine Safety Check", path: "daily-safety-check" },
      { title: "Quality Inspection", path: "check-quality" },
      { title: "Machine Down", path: "machine-downtime" },
      { title: "Work Instruction", path: "work-instruction" },
      //  { title: "Log Safety Check", path: "log-safetycheck" },
      //  { title: "Log Quality", path: "log-quality" },
      //  { title: "Log Daily Machine", path: "log-dailymachine" },
      //   { title: "Log Parameters", path: "log-parameters" },
      { title: "User Profile", path: "user-profile" },
    ],
    2: [
      { title: "Machine Safety Check", path: "daily-safety-check" },
      { title: "Log Safety Check", path: "log-safetycheck" },
      { title: "Quality Inspection", path: "check-quality" },
      { title: "Log Quality", path: "log-quality" },
      { title: "Log Parameters", path: "log-parameters" },
      { title: "Dashboard Status Machine", path: "status-machine-dashboard" },
      { title: "Work Instruction", path: "work-instruction" },
      { title: "User Profile", path: "user-profile" },
    ],
    3: [
      { title: "Machine Daily Check", path: "daily-machine-check" },
      { title: "Log Daily Machine", path: "log-dailymachine" },
      { title: "Machine Parameter Inspection", path: "check-parameters" },
      { title: "Log Parameters", path: "log-parameters" },
      { title: "Machine Down Dashboard", path: "machinedown-dashdoard" },
      { title: "User Profile", path: "user-profile" },
    ],
    4: [
      { title: "Log Daily Machine", path: "log-dailymachine" },
      { title: "Dashboard Status Machine", path: "status-machine-dashboard" },
      { title: "Output Dashboard", path: "output-dashboard" },
      { title: "Work Instruction", path: "work-instruction" },
      { title: "Register User", path: "register-user" },
      { title: "User Profile", path: "user-profile" },
    ],
    5: [
      { title: "Machine Daily Check", path: "daily-machine-check" },
      { title: "Log Daily Machine", path: "log-dailymachine" },
      { title: "Machine Parameter Inspection", path: "check-parameters" },
      { title: "Log Parameters", path: "log-parameters" },
      { title: "Log Safety Check", path: "log-safetycheck" },
      { title: "Log Quality", path: "log-quality" },
      { title: "Dashboard Status Machine", path: "status-machine-dashboard" },
      { title: "Output Dashboard", path: "output-dashboard" },
      { title: "Work Instruction", path: "work-instruction" },
      { title: "Register Technician", path: "register-user" },
      { title: "Machine Down Dashboard", path: "machinedown-dashdoard" },
      { title: "User Profile", path: "user-profile" },
      { title: "Machine Management", path: "machine-management" },
      { title: "Add Machine", path: "add-machine" },
    ],
    6: [
      { title: "Machine Safety Check", path: "daily-safety-check" },
      { title: "Log Safety Check", path: "log-safetycheck" },
      { title: "Machine Daily Check", path: "daily-machine-check" },
      { title: "Log Daily Machine", path: "log-dailymachine" },
      { title: "Machine Parameter Inspection", path: "check-parameters" },
      { title: "Log Parameters", path: "log-parameters" },
      { title: "Quality Inspection", path: "check-quality" },
      { title: "Log Quality", path: "log-quality" },
      { title: "Machine Down", path: "machine-downtime" },
      { title: "Dashboard Status Machine", path: "status-machine-dashboard" },
      { title: "Machine Down Dashboard", path: "machinedown-dashdoard" },
      { title: "Work Instruction", path: "work-instruction" },
      { title: "Output Dashboard", path: "output-dashboard" },
      { title: "Register User", path: "register-user" },
      { title: "Delete User", path: "delete-user" },
      { title: "User Profile", path: "user-profile" },
      { title: "Machine Management", path: "machine-management" },
      { title: "Add Machine", path: "add-machine" },
    ],
  };

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300">
      <div
        className={`max-w-4xl w-full space-y-8 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } p-8 rounded-3xl shadow-2xl transition-colors duration-300`}
      >
        <div className="space-y-6">
          <h2
            className={`text-4xl font-extrabold text-center ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            My Services
          </h2>
          <p
            className={`text-xl ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Welcome {user?.first_name} {user?.last_name}
          </p>
        </div>

        <nav className="mt-10">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems[currentRole]?.map((item, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(item.path)}
                className={`group relative ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-blue-50 hover:bg-blue-100"
                } rounded-xl transition duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg p-6 flex flex-col items-center text-center`}
              >
                <div
                  className={`mb-4 ${
                    darkMode ? "bg-gray-600" : "bg-blue-100"
                  } p-3 rounded-full transition-colors duration-300`}
                >
                  {React.cloneElement(getIcon(item.path), {
                    className: `h-6 w-6 ${
                      darkMode ? "text-blue-300" : "text-blue-600"
                    }`,
                  })}
                </div>
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {item.title}
                </h3>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default LevelUser;
