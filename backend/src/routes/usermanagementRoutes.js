// src/routes/usermanagementRoutes.js

const express = require("express");
const router = express.Router();
const UserManagementController = require("../controllers/usermanagementController");

// User Registration
router.post("/register", UserManagementController.register);

// User Management
router.delete("/delete", UserManagementController.deleteUser);
router.put("/profile", UserManagementController.updateProfile);
router.get("/profile", UserManagementController.getProfile);

module.exports = router;