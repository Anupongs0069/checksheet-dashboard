// src/routes/machinesRoutes.js

const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  findMachine,
} = require("../controllers/machinesController");

router.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    createParentPath: true,
  })
);

router.get("/", findMachine);
// router.get("/all", authenticateToken, getAllMachines);
router.get("/all",  getAllMachines);
router.get("/:id", authenticateToken, getMachineById);
router.put("/:id", authenticateToken, updateMachine);
router.delete("/:id", authenticateToken, deleteMachine);

router.post("/", createMachine);

module.exports = router;
