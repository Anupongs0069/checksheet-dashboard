// src/app/components/auth/UserProfileForm.jsx


"use client";

import React from "react";
import { Mail, Phone, Lock, CreditCard, Save } from 'lucide-react';

function UserProfileForm({
    userData,
    isEditing,
    darkMode,
    handleInputChange,
    updatePassword,
    handleSaveUpdate
}) {
    const buttonClass = `px-4 py-2 rounded-md text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`;

    const inputClass = `w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

    return (
        <div className="space-y-6">
            <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Employee ID
                </label>
                <div className="mt-1 flex items-center">
                    <CreditCard className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-2`} />
                    <span className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.employee_id}</span>
                </div>
            </div>
            <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    First Name
                </label>
                {isEditing ? (
                    <input
                        type="text"
                        name="first_name"
                        value={userData.first_name}
                        onChange={handleInputChange}
                        className={inputClass}
                    />
                ) : (
                    <div className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.first_name}</div>
                )}
            </div>
            <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Name
                </label>
                {isEditing ? (
                    <input
                        type="text"
                        name="last_name"
                        value={userData.last_name}
                        onChange={handleInputChange}
                        className={inputClass}
                    />
                ) : (
                    <div className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.last_name}</div>
                )}
            </div>
            <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                </label>
                {isEditing ? (
                    <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        className={inputClass}
                    />
                ) : (
                    <div className="mt-1 flex items-center">
                        <Mail className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-2`} />
                        <span className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.email}</span>
                    </div>
                )}
            </div>
            <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone Number
                </label>
                {isEditing ? (
                    <input
                        type="tel"
                        name="phone_number"
                        value={userData.phone_number}
                        onChange={handleInputChange}
                        className={inputClass}
                    />
                ) : (
                    <div className="mt-1 flex items-center">
                        <Phone className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-2`} />
                        <span className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.phone_number}</span>
                    </div>
                )}
            </div>
            <div className="flex justify-between">
                <button onClick={updatePassword} className={`${buttonClass} flex items-center`}>
                    <Lock className="w-5 h-5 mr-2" />
                    Change Password
                </button>
                {isEditing && (
                    <button onClick={handleSaveUpdate} className={`${buttonClass} flex items-center`}>
                        <Save className="w-5 h-5 mr-2" />
                        Save All Changes
                    </button>
                )}
            </div>
        </div>
    );
}

export default UserProfileForm;