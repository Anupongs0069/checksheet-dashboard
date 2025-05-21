// src/controllers/loginUserController.js
const loginUserService = require("../services/loginUserService");

const login = async (req, res) => {
  const { employee_id, password } = req.body;

  if (!employee_id || !password) {
    return res.status(400).json({
      success: false,
      message: "Employee ID and password are required.",
    });
  }

  try {
    const result = await loginUserService.checkLogin(employee_id, password);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      ...result
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error occurred during login.",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

module.exports = {
  login
};