// src/app/components/StatusMachineDashboard/ui-components/MachineCard.jsx

import React from "react";
import { Info } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import {
  STATUS_COLORS,
  STATUS_LABELS,
} from "../utils/helpers";
import { STATUS_ICONS } from "./StatusIndicator";
import { useDarkMode } from "@/app/components/DarkModeProvider";

const MachineCard = ({ machine, onViewDetails }) => {
  const { darkMode } = useDarkMode();
  
  // เพิ่ม console.log เพื่อดูข้อมูล machine ทั้งหมด
  // console.log("Machine data in MachineCard:", machine);
  
  // ฟังก์ชันสำหรับจัดการการคลิกปุ่ม View Details
  const handleViewDetails = () => {
    console.log("View Details clicked for machine:", machine);
   // console.log("Machine ID being passed:", machine.id);
    
    // เรียกใช้ฟังก์ชัน onViewDetails ที่ได้รับมาจาก props
    onViewDetails(machine.id);
  };

  return (
    <Card
      className={`shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col ${
        darkMode ? "bg-gray-800 text-white" : ""
      }`}
    >
      {/* ใช้ฟังก์ชัน STATUS_COLORS พร้อมส่ง darkMode เป็นพารามิเตอร์ */}
      <div className={`h-2 ${STATUS_COLORS[machine.status](darkMode)}`}></div>
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Header with Title and Status */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-bold text-lg">{machine.machine_name}</h3>
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[
              machine.status
            ](darkMode)} ${
              darkMode ? "bg-opacity-30" : "bg-opacity-20"
            } flex items-center gap-1`}
          >
            {STATUS_ICONS[machine.status]}
            <span>{STATUS_LABELS[machine.status]}</span>
          </div>
        </div>
        
        {/* Machine Information */}
        <div className="mt-1 text-sm flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Machine No.:
            </span>
            <span className="font-medium">{machine.machine_number || "-"}</span>
          </div>
        </div>
        
        {/* Spacer to push the action buttons to the bottom */}
        <div className="flex-grow"></div>
        
        {/* Action Buttons at Bottom */}
        <div className="mt-4 flex justify-start">
          <button
            className={`${
              darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
            } text-sm hover:underline flex items-center gap-1 font-medium`}
            onClick={handleViewDetails} // ใช้ฟังก์ชัน handleViewDetails แทน
          >
            <Info className="h-4 w-4" />
            <span>View Details</span>
          </button>
          
          {machine.status === "down" && (
            <button
              className={`${
                darkMode ? "text-red-400" : "text-red-500"
              } text-sm hover:underline hidden`}
            >
              แจ้งซ่อม
            </button>
          )}
          {machine.status === "waiting_leader_approval" && (
            <button
              className={`${
                darkMode ? "text-purple-400" : "text-purple-500"
              } text-sm hover:underline hidden`}
            >
              Leader Approve
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MachineCard;