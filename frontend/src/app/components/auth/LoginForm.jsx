// ./src/app/components/auth/LoginForm.jsx

"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";

const LoginForm = ({ onSubmit, isLoading }) => {
    const [employee_id, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ employee_id, password });
    };

    return (
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <div>
                    <label htmlFor="employee-id" className="block text-sm font-medium">
                        Employee ID
                    </label>
                    <input
                        id="employee-id"
                        name="employee-id"
                        type="text"
                        autoComplete="username"
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Employee ID"
                        value={employee_id}
                        onChange={(e) => setEmployeeId(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                    </span>
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </div>
        </form>
    );
};

export default LoginForm;