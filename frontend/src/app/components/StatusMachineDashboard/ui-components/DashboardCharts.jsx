// src/app/components/StatusMachineDashboard/components/ui-components/DashboardCharts.jsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PieChart, BarChart, TrendingUp, AlertCircle } from "lucide-react";
import { useDarkMode } from "@/app/components/DarkModeProvider";

// คอมโพเนนต์แผนภูมิสรุปสาเหตุการหยุดทำงาน
export const DowntimeReasonChart = ({ reasonsData }) => {
  const { darkMode } = useDarkMode();

  // ตรวจสอบว่ามีข้อมูลหรือไม่
  if (!reasonsData || reasonsData.length === 0) {
    return (
      <Card
        className={darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}
      >
        <CardContent className="p-6 text-center">
          <PieChart
            className={`h-12 w-12 mx-auto ${
              darkMode ? "text-gray-500" : "text-gray-400"
            } mb-2`}
          />
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
            ไม่มีข้อมูลสาเหตุการหยุดทำงานในช่วงเวลาที่เลือก
          </p>
        </CardContent>
      </Card>
    );
  }

  // เรียงลำดับข้อมูลตามเวลาหยุดทำงานรวม
  const sortedData = [...reasonsData].sort(
    (a, b) => b.total_downtime - a.total_downtime
  );
  const topReasons = sortedData.slice(0, 5);

  return (
    <Card className={darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}>
      <CardHeader>
        <CardTitle>สาเหตุการหยุดทำงานที่พบบ่อย</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topReasons.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{item.reason}</span>
                <span>{item.total_downtime.toFixed(1)} ชม.</span>
              </div>
              <div
                className={`w-full ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                } rounded-full h-2.5`}
              >
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${
                      (item.total_downtime / topReasons[0].total_downtime) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                } mt-1`}
              >
                {item.category} • {item.issue_count} ครั้ง
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// คอมโพเนนต์แผนภูมิประสิทธิภาพเครื่องจักร
export const MachinePerformanceChart = ({ machinesData }) => {
  const { darkMode } = useDarkMode();

  // ตรวจสอบว่ามีข้อมูลหรือไม่
  if (!machinesData || machinesData.length === 0) {
    return (
      <Card
        className={darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}
      >
        <CardContent className="p-6 text-center">
          <BarChart
            className={`h-12 w-12 mx-auto ${
              darkMode ? "text-gray-500" : "text-gray-400"
            } mb-2`}
          />
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
            ไม่มีข้อมูลประสิทธิภาพเครื่องจักรในช่วงเวลาที่เลือก
          </p>
        </CardContent>
      </Card>
    );
  }

  // เรียงลำดับข้อมูลตามเวลาหยุดทำงานรวม
  const sortedData = [...machinesData]
    .sort(
      (a, b) =>
        (b.total_downtime_minutes || 0) - (a.total_downtime_minutes || 0)
    )
    .slice(0, 5);

  return (
    <Card className={darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}>
      <CardHeader>
        <CardTitle>เครื่องจักรที่มีเวลาหยุดทำงานสูงสุด</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedData.map((machine, index) => {
            const downtimeHours = (
              (machine.total_downtime_minutes || 0) / 60
            ).toFixed(1);
            const maxDowntime =
              (sortedData[0].total_downtime_minutes || 1) / 60;

            return (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{machine.machine_name}</span>
                  <span>{downtimeHours} ชม.</span>
                </div>
                <div
                  className={`w-full ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  } rounded-full h-2.5`}
                >
                  <div
                    className="bg-red-500 h-2.5 rounded-full"
                    style={{ width: `${(downtimeHours / maxDowntime) * 100}%` }}
                  ></div>
                </div>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  } mt-1`}
                >
                  {machine.machine_number} • {machine.incident_count || 0} ครั้ง
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// คอมโพเนนต์แผนภูมิแนวโน้มเวลา
export const TimeSeriesChart = ({ timeSeriesData }) => {
  const { darkMode } = useDarkMode();

  // ตรวจสอบว่ามีข้อมูลหรือไม่
  if (!timeSeriesData || timeSeriesData.length === 0) {
    return (
      <Card
        className={darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}
      >
        <CardContent className="p-6 text-center">
          <TrendingUp
            className={`h-12 w-12 mx-auto ${
              darkMode ? "text-gray-500" : "text-gray-400"
            } mb-2`}
          />
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
            ไม่มีข้อมูลแนวโน้มในช่วงเวลาที่เลือก
          </p>
        </CardContent>
      </Card>
    );
  }

  // สร้าง labels และ data
  const labels = timeSeriesData.map((item) => item.time_period);
  const downtimeData = timeSeriesData.map((item) =>
    parseFloat(item.total_downtime)
  );
  const incidentData = timeSeriesData.map((item) => parseInt(item.issue_count));

  return (
    <Card className={darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}>
      <CardHeader>
        <CardTitle>แนวโน้มการหยุดทำงาน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="h-64 w-full">
            {/* แสดงกราฟแท่งสำหรับจำนวนอุบัติการณ์ */}
            <div className="absolute inset-0">
              <div className="flex items-end h-full">
                {incidentData.map((count, i) => {
                  const height = `${
                    (count / Math.max(...incidentData, 1)) * 100
                  }%`;
                  return (
                    <div key={`incident-${i}`} className="flex-1 mx-0.5">
                      <div
                        className="bg-blue-200 w-full"
                        style={{ height }}
                        title={`${labels[i]}: ${count} ครั้ง`}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* แสดงกราฟเส้นสำหรับเวลาหยุดทำงานรวม */}
            <div className="absolute inset-0 pointer-events-none">
              <svg
                className="w-full h-full overflow-visible"
                viewBox={`0 0 ${timeSeriesData.length - 1} 100`}
                preserveAspectRatio="none"
              >
                <polyline
                  points={downtimeData
                    .map((value, i) => {
                      const maxValue = Math.max(...downtimeData);
                      const y = maxValue ? 100 - (value / maxValue) * 100 : 0;
                      return `${i} ${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                {downtimeData.map((value, i) => {
                  const maxValue = Math.max(...downtimeData);
                  const y = maxValue ? 100 - (value / maxValue) * 100 : 0;
                  return (
                    <circle
                      key={i}
                      cx={i}
                      cy={y}
                      r="3"
                      fill="rgb(239, 68, 68)"
                      stroke={darkMode ? "#374151" : "white"}
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="flex justify-between mt-2 text-xs">
            {labels.map((label, i) => (
              <div
                key={i}
                className={darkMode ? "text-gray-400" : "text-gray-500"}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-blue-200"></div>
            <span
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              จำนวนครั้ง
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-red-500"></div>
            <span
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              เวลาหยุดทำงาน (ชม.)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// คอมโพเนนต์แสดงตัวเลขสรุป
export const SummaryStats = ({ summaryData }) => {
  const { darkMode } = useDarkMode();

  if (!summaryData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className={`animate-pulse ${
              darkMode ? "bg-gray-800 border-gray-700" : ""
            }`}
          >
            <CardContent className="p-6">
              <div
                className={`h-4 ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                } rounded mb-2 w-2/3`}
              ></div>
              <div
                className={`h-6 ${
                  darkMode ? "bg-gray-600" : "bg-gray-300"
                } rounded mb-2 w-1/3`}
              ></div>
              <div
                className={`h-4 ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                } rounded w-1/2`}
              ></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "เวลาหยุดทำงานรวม",
      value: `${summaryData.totalDowntime || 0} ชม.`,
      desc: "ทั้งหมดในช่วงเวลาที่เลือก",
      color: "text-red-500",
    },
    {
      label: "ปัญหาที่ยังไม่แก้ไข",
      value: summaryData.activeIssues || 0,
      desc: "จำนวนที่ต้องดำเนินการ",
      color: "text-yellow-500",
    },
    {
      label: "แก้ไขแล้ววันนี้",
      value: summaryData.resolvedToday || 0,
      desc: "ปัญหาที่แก้ไขเสร็จวันนี้",
      color: "text-green-500",
    },
    {
      label: "เวลาแก้ไขเฉลี่ย",
      value: `${summaryData.avgResolutionTime || 0} ชม.`,
      desc: "ต่อการหยุดทำงาน 1 ครั้ง",
      color: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card
          key={i}
          className={darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}
        >
          <CardContent className="p-6">
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {stat.label}
            </p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {stat.desc}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// คอมโพเนนต์แสดงปัญหาที่กำลังดำเนินการ
export const ActiveIssuesTable = ({ issues }) => {
  const { darkMode } = useDarkMode();

  if (!issues || issues.length === 0) {
    return (
      <Card
        className={darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}
      >
        <CardHeader>
          <CardTitle>ปัญหาที่กำลังดำเนินการ</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6">
          <AlertCircle
            className={`h-12 w-12 mx-auto ${
              darkMode ? "text-gray-500" : "text-gray-400"
            } mb-2`}
          />
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
            ไม่มีปัญหาที่กำลังดำเนินการในขณะนี้
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return darkMode
          ? "bg-gray-600 text-gray-200"
          : "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "สูง";
      case "medium":
        return "กลาง";
      case "low":
        return "ต่ำ";
      default:
        return priority;
    }
  };

  return (
    <Card className={darkMode ? "bg-gray-800 border-gray-700 text-white" : ""}>
      <CardHeader>
        <CardTitle>ปัญหาที่กำลังดำเนินการ ({issues.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`overflow-hidden rounded-lg border ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase`}
                >
                  เครื่องจักร
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase`}
                >
                  ปัญหา
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase`}
                >
                  ความสำคัญ
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase`}
                >
                  เวลา
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase`}
                >
                  เวลาหยุดทำงาน
                </th>
              </tr>
            </thead>
            <tbody
              className={`${darkMode ? "bg-gray-800" : "bg-white"} divide-y ${
                darkMode ? "divide-gray-700" : "divide-gray-200"
              }`}
            >
              {issues.map((issue, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 text-sm font-medium">
                    {issue.machineName}
                  </td>
                  <td className="px-4 py-2 text-sm max-w-[200px] truncate">
                    {issue.issue}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                        issue.priority
                      )}`}
                    >
                      {getPriorityLabel(issue.priority)}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-2 text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {issue.startTime}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-right">
                    {issue.downtime} ชม.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
