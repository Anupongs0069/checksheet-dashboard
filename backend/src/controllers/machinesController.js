// src/controllers/machinesController.js

const machinesService = require("../services/machinesService");

// getAllMachines
const getAllMachines = async (req, res) => {
  try {
    const machines = await machinesService.getAllMachines();
    res.status(200).json({
      message: "Machines retrieved successfully",
      machines: machines,
    });
  } catch (error) {
    console.error("Error getting machines:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// getMachineById
const getMachineById = async (req, res) => {
  try {
    const machine = await machinesService.getMachineById(req.params.id);
    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }
    res.status(200).json({
      message: "Machine retrieved successfully",
      machine: machine,
    });
  } catch (error) {
    console.error("Error getting machine:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// createMachine
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

const createMachine = async (req, res) => {
  try {
    if (!req.body.machine_name || !req.body.machine_number) {
      return res.status(400).json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น",
      });
    }

    const result = await machinesService.createMachine(req.body);
    const machineId = result.machine_id;

    if (req.files && req.files.image) {
      const image = req.files.image;

      if (!image.mimetype.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          error: "กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น",
        });
      }

      if (image.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: "ขนาดไฟล์ต้องไม่เกิน 10MB",
        });
      }

      try {
        const imagePath = path.join(__dirname, "../assets/images/machines");
        await fs.mkdir(imagePath, { recursive: true });

        const fileName = `machine_${machineId}.webp`;
        const fullPath = path.join(imagePath, fileName);

        await sharp(image.data)
          .resize(3024, 4032, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toFile(fullPath);

        const dbImagePath = `/assets/images/machines/${fileName}`;
        await machinesService.updateMachineImage(machineId, dbImagePath);
      } catch (imageError) {
        console.error("Error processing image:", imageError);

        return res.status(201).json({
          success: true,
          message: "บันทึกข้อมูลสำเร็จ แต่มีปัญหาในการประมวลผลรูปภาพ",
          data: result,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "บันทึกข้อมูลสำเร็จ",
      data: result,
    });
  } catch (error) {
    console.error("Error creating machine:", error);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
    });
  }
};

// updateMachine
const updateMachine = async (req, res) => {
  try {
    const updatedMachine = await machinesService.updateMachine(
      req.params.id,
      req.body
    );
    if (!updatedMachine) {
      return res.status(404).json({ message: "Machine not found" });
    }
    res.status(200).json({
      message: "Machine updated successfully",
      machine: updatedMachine,
    });
  } catch (error) {
    console.error("Error updating machine:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// deleteMachine
const deleteMachine = async (req, res) => {
  try {
    const deletedMachine = await machinesService.deleteMachine(req.params.id);
    if (!deletedMachine) {
      return res.status(404).json({ message: "Machine not found" });
    }
    res.status(200).json({
      message: "Machine deleted successfully",
      machine: deletedMachine,
    });
  } catch (error) {
    console.error("Error deleting machine:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};


// findMachine
const findMachine = async (req, res) => {
  try {
    const { machine_name, machine_number, model } = req.query;

    if (!machine_name || !machine_number || !model) {
      return res.json(null);
    }

    const machine = await machinesService.findMachine(
      machine_name,
      machine_number,
      model
    );

    if (!machine) {
      return res.json(null);
    }

    // ส่งข้อมูลที่ต้องการกลับไป
    res.json({
      id: machine.id,
      customer: machine.customer,
      series_number: machine.series_number,
      product: machine.product,
    });
  } catch (error) {
    console.error("Error finding machine:", error);
    res.status(500).json(null);
  }
};

module.exports = {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  findMachine,
};
