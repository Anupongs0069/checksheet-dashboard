// src/app/main-menu/machine-management/page.jsx

"use client";

import React, { useState } from "react";
import { useDarkMode } from "../../components/DarkModeProvider";
import { useAuth } from "../../../contexts/AuthContext";
import { Plus, Settings, Sun, Moon, ListChecks } from "lucide-react";
import Swal from "sweetalert2";

function MachineManagementPage() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [machineInfo, setMachineInfo] = useState({
    name: "",
    number: "",
    model: "",
    customer: "",
    family: "",
  });

  const [checklistGroups, setChecklistGroups] = useState([
    {
      id: 1,
      name: "Adapter's cleanliness",
      thaiName: "การตรวจเช็คความสะอาดของ Adapter",
      items: [
        {
          id: 1,
          name: "Dust particles or a stain present on the devices holder",
          thaiName: "ฝุ่นละอองหรือคราบสกปรกบนตัวยึดอุปกรณ์",
          frequency: "daily",
        },
        {
          id: 2,
          name: "Presence of plastic residue",
          thaiName: "ตวรจสอบเศษตะกั่วของบัดกรีที่ตกค้าง",
          frequency: "daily",
        },
        {
          id: 3,
          name: "Dust particles or a stain present on the adapter",
          thaiName: "ตรวจสอบฝุ่นหรือคราบสกปรกบน Adapter",
          frequency: "weekly",
        },
      ],
    },
  ]);

  const [newGroup, setNewGroup] = useState({
    name: "",
    thaiName: "",
  });

  const [newItem, setNewItem] = useState({
    groupId: "",
    name: "",
    thaiName: "",
    frequency: "daily",
  });

  const handleMachineSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: API call to save machine info
      console.log("Machine Info:", machineInfo);
      await Swal.fire({
        icon: "success",
        title: "บันทึกข้อมูลเครื่องจักรสำเร็จ",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      const newGroupData = {
        id: checklistGroups.length + 1,
        ...newGroup,
        items: [],
      };
      setChecklistGroups([...checklistGroups, newGroupData]);
      setNewGroup({ name: "", thaiName: "" });
      await Swal.fire({
        icon: "success",
        title: "เพิ่มหมวดหมู่สำเร็จ",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const groupIndex = checklistGroups.findIndex(
        (group) => group.id === parseInt(newItem.groupId)
      );
      if (groupIndex === -1) throw new Error("ไม่พบหมวดหมู่ที่เลือก");

      const newItemData = {
        id:
          Math.max(
            ...checklistGroups[groupIndex].items.map((item) => item.id),
            0
          ) + 1,
        name: newItem.name,
        thaiName: newItem.thaiName,
        frequency: newItem.frequency,
      };

      const updatedGroups = [...checklistGroups];
      updatedGroups[groupIndex].items.push(newItemData);
      setChecklistGroups(updatedGroups);
      setNewItem({
        groupId: "",
        name: "",
        thaiName: "",
        frequency: "daily",
      });

      await Swal.fire({
        icon: "success",
        title: "เพิ่มรายการตรวจเช็คสำเร็จ",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };

  const inputClass = `w-full px-3 py-2 border rounded-md ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900"
  } focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} p-8`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Settings
              className={`w-8 h-8 ${
                darkMode ? "text-indigo-400" : "text-indigo-500"
              }`}
            />
            <h2
              className={`text-3xl font-extrabold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              จัดการเครื่องจักรและรายการตรวจเช็ค
            </h2>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${
              darkMode
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

        {/* Machine Info Form */}
        <div
          className={`p-6 rounded-lg shadow-md ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3
            className={`text-xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            ข้อมูลเครื่องจักร
          </h3>
          <form onSubmit={handleMachineSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Machine Name
                </label>
                <input
                  type="text"
                  value={machineInfo.name}
                  onChange={(e) =>
                    setMachineInfo({ ...machineInfo, name: e.target.value })
                  }
                  className={inputClass}
                  placeholder="ชื่อเครื่องจักร"
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Machine No
                </label>
                <input
                  type="text"
                  value={machineInfo.number}
                  onChange={(e) =>
                    setMachineInfo({ ...machineInfo, number: e.target.value })
                  }
                  className={inputClass}
                  placeholder="หมายเลขเครื่องจักร"
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Model
                </label>
                <input
                  type="text"
                  value={machineInfo.model}
                  onChange={(e) =>
                    setMachineInfo({ ...machineInfo, model: e.target.value })
                  }
                  className={inputClass}
                  placeholder="รุ่น"
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Customer
                </label>
                <input
                  type="text"
                  value={machineInfo.customer}
                  onChange={(e) =>
                    setMachineInfo({ ...machineInfo, customer: e.target.value })
                  }
                  className={inputClass}
                  placeholder="ลูกค้า"
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Family
                </label>
                <input
                  type="text"
                  value={machineInfo.family}
                  onChange={(e) =>
                    setMachineInfo({ ...machineInfo, family: e.target.value })
                  }
                  className={inputClass}
                  placeholder="ตระกูล"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className={`w-full px-4 py-2 text-white rounded-md ${
                darkMode
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              บันทึกข้อมูลเครื่องจักร
            </button>
          </form>
        </div>

        {/* Checklist Management */}
        <div
          className={`p-6 rounded-lg shadow-md ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3
            className={`text-xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            จัดการรายการตรวจเช็ค
          </h3>

          {/* Add Checklist Group */}
          <form onSubmit={handleAddGroup} className="space-y-4 mb-8">
            <h4
              className={`text-lg font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              เพิ่มหมวดหมู่
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  ชื่อหมวดหมู่ (English)
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  ชื่อหมวดหมู่ (ไทย)
                </label>
                <input
                  type="text"
                  value={newGroup.thaiName}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, thaiName: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className={`w-full px-4 py-2 text-white rounded-md ${
                darkMode
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              เพิ่มหมวดหมู่
            </button>
          </form>

          {/* Add Checklist Item */}
          <form onSubmit={handleAddItem} className="space-y-4">
            <h4
              className={`text-lg font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              เพิ่มรายการตรวจเช็ค
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  หมวดหมู่
                </label>
                <select
                  value={newItem.groupId}
                  onChange={(e) =>
                    setNewItem({ ...newItem, groupId: e.target.value })
                  }
                  className={inputClass}
                  required
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {checklistGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.thaiName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  ความถี่
                </label>
                <select
                  value={newItem.frequency}
                  onChange={(e) =>
                    setNewItem({ ...newItem, frequency: e.target.value })
                  }
                  className={inputClass}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  รายการตรวจเช็ค (English)
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  รายการตรวจเช็ค (ไทย)
                </label>
                <input
                  type="text"
                  value={newItem.thaiName}
                  onChange={(e) =>
                    setNewItem({ ...newItem, thaiName: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className={`w-full px-4 py-2 text-white rounded-md ${
                darkMode
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              เพิ่มรายการตรวจเช็ค
            </button>
          </form>

          {/* Display Existing Checklists */}
          <div className="mt-8">
            <h4
              className={`text-lg font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              รายการตรวจเช็คทั้งหมด
            </h4>
            <div className="space-y-6">
              {checklistGroups.map((group) => (
                <div
                  key={group.id}
                  className={`p-4 rounded-lg border ${
                    darkMode
                      ? "border-gray-700 bg-gray-750"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <h5
                    className={`text-lg font-medium mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {group.name} ({group.thaiName})
                  </h5>
                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-md ${
                          darkMode ? "bg-gray-700" : "bg-white"
                        } shadow-sm`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p
                              className={`font-medium ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {item.name}
                            </p>
                            <p
                              className={`text-sm ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {item.thaiName}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.frequency === "daily"
                                ? "bg-green-100 text-green-800"
                                : item.frequency === "weekly"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {item.frequency.charAt(0).toUpperCase() +
                              item.frequency.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MachineManagementPage;
