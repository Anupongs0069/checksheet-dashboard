// src/app/main-menu/output-dashbashboard/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../components/DarkModeProvider';
// import axios from 'axios'; // จะใช้จริงตอนต่อ API
import { BarChart3, Clock, Calendar, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function OutputDashboardPage() {
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const [timeframe, setTimeframe] = useState('daily');
  const [outputData, setOutputData] = useState({
    summary: {
      totalOutput: 0,
      targetOutput: 0,
      efficiency: 0,
      downtime: 0
    },
    trend: []
  });

  // Mock Data สำหรับทดสอบการแสดงผล
  const mockData = {
    daily: {
      summary: {
        totalOutput: 1500,
        targetOutput: 2000,
        efficiency: 75,
        downtime: 2.5
      },
      trend: [
        { date: '08:00', actual: 200, target: 250 },
        { date: '10:00', actual: 450, target: 500 },
        { date: '12:00', actual: 700, target: 750 },
        { date: '14:00', actual: 950, target: 1000 },
        { date: '16:00', actual: 1200, target: 1250 },
        { date: '18:00', actual: 1500, target: 1500 },
      ]
    },
    weekly: {
      summary: {
        totalOutput: 10500,
        targetOutput: 12000,
        efficiency: 87.5,
        downtime: 12
      },
      trend: [
        { date: 'Mon', actual: 2100, target: 2400 },
        { date: 'Tue', actual: 2300, target: 2400 },
        { date: 'Wed', actual: 1900, target: 2400 },
        { date: 'Thu', actual: 2200, target: 2400 },
        { date: 'Fri', actual: 2000, target: 2400 },
      ]
    },
    monthly: {
      summary: {
        totalOutput: 42000,
        targetOutput: 45000,
        efficiency: 93.3,
        downtime: 48
      },
      trend: [
        { date: 'Week 1', actual: 10500, target: 11250 },
        { date: 'Week 2', actual: 10800, target: 11250 },
        { date: 'Week 3', actual: 10200, target: 11250 },
        { date: 'Week 4', actual: 10500, target: 11250 },
      ]
    }
  };

  // useEffect สำหรับจำลองการดึงข้อมูล
  useEffect(() => {
    // จำลองการดึงข้อมูล
    const fetchMockData = () => {
      // จำลอง delay เหมือนดึงข้อมูลจริง
      setTimeout(() => {
        setOutputData(mockData[timeframe]);
      }, 500);
    };

    fetchMockData();

    // ตอนต่อ API จริงจะเป็นแบบนี้
    /*
    const fetchOutputData = async () => {
      try {
        const response = await axios.get(`http://10.211.55.12:5000/api/output/${timeframe}`);
        setOutputData(response.data);
      } catch (error) {
        console.error('Error fetching output data:', error);
      }
    };
    fetchOutputData();
    */
  }, [timeframe]);

  // Styling classes
  const cardClass = `p-6 rounded-lg shadow-md ${
    darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
  }`;

  const metricCardClass = `${cardClass} flex items-center justify-between`;

  const buttonClass = `px-4 py-2 rounded-md text-white ${
    darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-8`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ส่วนหัว Dashboard */}
        <div className="flex justify-between items-center">
          <h2 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Production Output Dashboard
          </h2>
          {/* ปุ่มเลือกช่วงเวลา */}
          <div className="flex space-x-4">
            <button
              onClick={() => setTimeframe('daily')}
              className={`${buttonClass} ${timeframe === 'daily' ? 'ring-2' : ''}`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`${buttonClass} ${timeframe === 'weekly' ? 'ring-2' : ''}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`${buttonClass} ${timeframe === 'monthly' ? 'ring-2' : ''}`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* การ์ดแสดงตัวชี้วัดหลัก */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* การ์ด Total Output */}
          <div className={metricCardClass}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Output</p>
              <p className="text-2xl font-bold mt-1">{outputData.summary.totalOutput}</p>
            </div>
            <BarChart3 className={`w-12 h-12 ${darkMode ? 'text-indigo-400' : 'text-blue-500'}`} />
          </div>

          {/* การ์ด Target Output */}
          <div className={metricCardClass}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Target Output</p>
              <p className="text-2xl font-bold mt-1">{outputData.summary.targetOutput}</p>
            </div>
            <ArrowUpCircle className={`w-12 h-12 ${darkMode ? 'text-indigo-400' : 'text-blue-500'}`} />
          </div>

          {/* การ์ด Efficiency */}
          <div className={metricCardClass}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Efficiency</p>
              <p className="text-2xl font-bold mt-1">{outputData.summary.efficiency}%</p>
            </div>
            <RefreshCw className={`w-12 h-12 ${darkMode ? 'text-indigo-400' : 'text-blue-500'}`} />
          </div>

          {/* การ์ด Downtime */}
          <div className={metricCardClass}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Downtime</p>
              <p className="text-2xl font-bold mt-1">{outputData.summary.downtime} hrs</p>
            </div>
            <ArrowDownCircle className={`w-12 h-12 ${darkMode ? 'text-indigo-400' : 'text-blue-500'}`} />
          </div>
        </div>

        {/* กราฟแสดงแนวโน้ม */}
        <div className={cardClass}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Output Trend</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={outputData.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  name="Actual Output"
                  stroke={darkMode ? '#818cf8' : '#3b82f6'} 
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  name="Target Output"
                  stroke={darkMode ? '#6ee7b7' : '#34d399'} 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutputDashboardPage;