// .src/app/components/LogParameters/LogParametersForm.jsx

"use client";

import React, { useState } from "react";
import {
    Search,
    Calendar,
    XCircle,
    Filter,
    Download
} from "lucide-react";

const LogParametersForm = ({
    darkMode,
    getCustomers,
    getProducts,
    onSearch,
    onExport
}) => {
    const [searchTermName, setSearchTermName] = useState("");
    const [searchTermNumber, setSearchTermNumber] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState("all");
    const [selectedProduct, setSelectedProduct] = useState("all");

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
            searchTermName,
            searchTermNumber,
            startDate,
            endDate,
            selectedCustomer,
            selectedProduct
        });
    };

    const handleReset = () => {
        setSearchTermName("");
        setSearchTermNumber("");
        setStartDate("");
        setEndDate("");
        setSelectedCustomer("all");
        setSelectedProduct("all");

        // Call onSearch with reset values
        onSearch({
            searchTermName: "",
            searchTermNumber: "",
            startDate: "",
            endDate: "",
            selectedCustomer: "all",
            selectedProduct: "all"
        });
    };

    return (
        <div className="space-y-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        className={`${inputClass} pl-10`}
                        value={searchTermName}
                        onChange={(e) => setSearchTermName(e.target.value)}
                        placeholder="Search Machine Name"
                    />
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        className={`${inputClass} pl-10`}
                        value={searchTermNumber}
                        onChange={(e) => setSearchTermNumber(e.target.value)}
                        placeholder="Search Machine Number"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                        className={`${selectClass} pl-10`}
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                    >
                        {getCustomers().map((customer, index) => (
                            <option
                                key={`customer-${index}-${customer}`}
                                value={customer}
                            >
                                {customer === "all" ? "All Customers" : customer}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                        className={`${selectClass} pl-10`}
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                        {getProducts().map((product, index) => (
                            <option key={`product-${index}-${product}`} value={product}>
                                {product === "all" ? "All Products" : product}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="date"
                        className={`${inputClass} pl-10`}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="date"
                        className={`${inputClass} pl-10`}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
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
                    Reset filter.
                </button>
                <button
                    onClick={handleSearch}
                    className={`px-6 py-2.5 rounded-md bg-blue-500 text-white hover:bg-blue-600 
            transition-colors flex items-center gap-2 text-sm font-medium
            ${darkMode ? "hover:bg-blue-700" : "hover:bg-blue-600"}
            disabled:bg-gray-400 disabled:cursor-not-allowed`}
                >
                    <Search className="w-4 h-4" />
                    Search.
                </button>
                <button
                    onClick={onExport}
                    className={`px-6 py-2.5 rounded-md bg-green-500 text-white hover:bg-green-600 
            transition-colors flex items-center gap-2 text-sm font-medium`}
                >
                    <Download className="w-4 h-4" />
                    Export CSV.
                </button>
            </div>
        </div>
    );
};

export default LogParametersForm;