// src/app/main-menu/UserProfile/page.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../components/DarkModeProvider';
import axios from 'axios';
import Swal from 'sweetalert2';
import { User, Lock } from 'lucide-react';
import UserProfileForm from '../../components/auth/UserProfileForm';

function UserProfilePage() {
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const [userData, setUserData] = useState({
    employee_id: '',
    email: '',
    phone_number: '',
    first_name: '',
    last_name: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setUserData({
        employee_id: user.employee_id || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/api/user-management/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.user) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Profile',
        text: error.response?.data?.message || 'An error occurred while loading your profile.',
        confirmButtonColor: darkMode ? '#4C51BF' : '#3B82F6',
      });
    }
  };

  useEffect(() => {
    if (!userData.employee_id) {
      fetchUserProfile();
    }
  }, []);

  const updateProfile = async (data) => {
    try {
      const response = await axios.put("/api/user-management/profile", {
        ...userData,
        ...data
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // ไม่ใช้ setUser แต่ใช้ setUserData โดยตรง
      setUserData(response.data.user);
      setIsEditing(false);

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: response.data.message,
        confirmButtonColor: darkMode ? '#4C51BF' : '#3B82F6',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'An error occurred while updating your profile.',
        confirmButtonColor: darkMode ? '#4C51BF' : '#3B82F6',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSaveUpdate = () => {
    updateProfile(userData);
  };

  const updatePassword = async () => {
    const { value: password } = await Swal.fire({
      title: "Change Password",
      input: "password",
      inputLabel: "New Password",
      inputPlaceholder: "Enter your new password",
      inputAttributes: {
        maxlength: "20",
        autocapitalize: "off",
        autocorrect: "off"
      },
      confirmButtonColor: darkMode ? '#4C51BF' : '#3B82F6',
    });

    if (password) {
      try {
        const response = await axios.put("/api/user-management/update-password", {
          employee_id: userData.employee_id,
          password: password
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        Swal.fire({
          icon: 'success',
          title: 'Password Updated',
          text: 'Your password has been successfully updated.',
          confirmButtonColor: darkMode ? '#4C51BF' : '#3B82F6',
        });
      } catch (error) {
        console.error('Error updating password:', error);
        Swal.fire({
          icon: 'error',
          title: 'Password Update Failed',
          text: error.response?.data?.message || 'An error occurred while updating your password.',
          confirmButtonColor: darkMode ? '#4C51BF' : '#3B82F6',
        });
      }
    }
  };

  const buttonClass = `px-4 py-2 rounded-md text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`;

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-lg w-full space-y-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-10 rounded-xl shadow-lg`}>
        <div className="flex justify-between items-center">
          <h2 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            User Profile
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`${buttonClass} flex items-center`}
          >
            {isEditing ? (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Lock
              </>
            ) : (
              <>
                <User className="w-5 h-5 mr-2" />
                Edit
              </>
            )}
          </button>
        </div>

        <UserProfileForm
          userData={userData}
          isEditing={isEditing}
          darkMode={darkMode}
          handleInputChange={handleInputChange}
          updatePassword={updatePassword}
          handleSaveUpdate={handleSaveUpdate}
        />
      </div>
    </div>
  );
}

export default UserProfilePage;