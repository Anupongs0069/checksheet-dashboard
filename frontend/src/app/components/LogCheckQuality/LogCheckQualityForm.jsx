// ./src/app/components/LogCheckQuality/LogCheckQualityForm.jsx

"use client";

import React, { useState } from "react";
import {
    Search,
    Calendar,
    XCircle,
    Filter,
    Download,
    User
} from "lucide-react";

const LogCheckQualityForm = ({
    darkMode,
    getWorkOrders,
    getMachineNames,
    onSearch,
    onExport
}) => {
    const [searchTermMachine, setSearchTermMachine] = useState("");
    const [searchTermWorkOrder, setSearchTermWorkOrder] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState("all");
    const [selectedResult, setSelectedResult] = useState("all");

    const inputClass = `w-full px-3 py-2 border rounded-md ${darkMode
            ? "bg-gray-700 border-gray-600 text-white"
            : "bg-gray-100 border-gray-300 text-gray-900"
        } focus:outline-none`;

    const selectClass = `w-full px-3 py-2 border rounded-md ${darkMode
            ? "bg-gray-700 border-gray-600 text-white"
            : "bg-gray-100 border-gray-300 text-gray-900"
        } focus:outline-none`;

    const handleSearch = () => {
        onSearch({
            searchTermMachine,
            searchTermWorkOrder,
            startDate,
            endDate,
            selectedEmployee,
            selectedResult
        });
    };

    const handleReset = () => {
        setSearchTermMachine("");
        setSearchTermWorkOrder("");
        setStartDate("");
        setEndDate("");
        setSelectedEmployee("all");
        setSelectedResult("all");

        // Call onSearch with reset values
        onSearch({
            searchTermMachine: "",
            searchTermWorkOrder: "",
            startDate: "",
            endDate: "",
            selectedEmployee: "all",
            selectedResult: "all"
        });
    };

    return (
        <div className="space-y-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        className={`${inputClass} pl-10`}
                        value={searchTermMachine}
                        onChange={(e) => setSearchTermMachine(e.target.value)}
                        placeholder="Search Machine Name"
                    />
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        className={`${inputClass} pl-10`}
                        value={searchTermWorkOrder}
                        onChange={(e) => setSearchTermWorkOrder(e.target.value)}
                        placeholder="Search Work Order"
                    />
                </div>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        className={`${inputClass} pl-10`}
                        value={selectedEmployee !== "all" ? selectedEmployee : ""}
                        onChange={(e) => setSelectedEmployee(e.target.value || "all")}
                        placeholder="Employee ID"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                        className={`${selectClass} pl-10`}
                        value={selectedResult}
                        onChange={(e) => setSelectedResult(e.target.value)}
                    >
                        <option value="all">All Results</option>
                        <option value="pass">Pass</option>
                        <option value="fail">Fail</option>
                        <option value="idle">Idle</option>
                    </select>
                </div>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="date"
                        className={`${inputClass} pl-10`}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Start Date"
                    />
                </div>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="date"
                        className={`${inputClass} pl-10`}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="End Date"
                    />
                </div>
            </div>

            {/* Search, Reset and Export Buttons */}
            <div className="flex justify-end space-x-4">
                <button
                    onClick={handleReset}
                    className={`px-6 py-2.5 rounded-md border border-gray-300 
            ${darkMode
                            ? "text-gray-200 hover:bg-gray-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }
            transition-colors flex items-center gap-2 text-sm font-medium`}
                >
                    <XCircle className="w-4 h-4" />
                    Reset Filters
                </button>
                <button
                    onClick={handleSearch}
                    className={`px-6 py-2.5 rounded-md bg-blue-500 text-white hover:bg-blue-600 
            transition-colors flex items-center gap-2 text-sm font-medium
            ${darkMode ? "hover:bg-blue-700" : "hover:bg-blue-600"}
            disabled:bg-gray-400 disabled:cursor-not-allowed`}
                >
                    <Search className="w-4 h-4" />
                    Search
                </button>
                <button
                    onClick={onExport}
                    className={`px-6 py-2.5 rounded-md bg-green-500 text-white hover:bg-green-600 
            transition-colors flex items-center gap-2 text-sm font-medium`}
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>
        </div>
    );
};

export default LogCheckQualityForm;