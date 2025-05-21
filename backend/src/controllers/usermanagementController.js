// src/controllers/usermanagementController.js

const UserManagementService = require("../services/usermanagementService");

// createUser function
const register = async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.employee_id || !userData.password || !userData.role) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }
    const result = await UserManagementService.createUser(userData);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to register user"
    });
  }
};

// deleteUser function
const deleteUser = async (req, res) => {
  const { employee_id } = req.body;
  if (!employee_id) {
    return res.status(400).json({ message: "Employee ID is required." });
  }
  try {
    const result = await UserManagementService.deleteUser(employee_id);
    if (!result) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error during user deletion:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// updateProfile function
const updateProfile = async (req, res) => {
  const { employee_id, first_name, last_name, email, phone_number } = req.body;
  if (!employee_id) {
    return res.status(400).json({ message: "Employee ID is required." });
  }
  try {
    const result = await UserManagementService.updateProfile({
      employee_id,
      first_name,
      last_name,
      email,
      phone_number
    });
    if (!result) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({
      message: "Profile updated successfully.",
      user: result,
    });
  } catch (error) {
    console.error("Error during profile update:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
  
// getProfile function
const getProfile = async (req, res) => {
  const { employee_id } = req.user;
  try {
    const result = await UserManagementService.getProfile(employee_id);
    if (!result) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({
      message: "Profile retrieved successfully.",
      user: result,
    });
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

module.exports = {
  register,
  deleteUser,
  updateProfile,
  getProfile,
};