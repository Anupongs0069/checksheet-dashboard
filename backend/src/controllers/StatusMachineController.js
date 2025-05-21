// ./src/controllers/StatusMachineController.js

const StatusMachineService = require("../services/StatusMachineService");

class StatusMachineController {
  static async getAllMachines(req, res) {
    try {
      const machines = await StatusMachineService.getAllMachines();

      return res.status(200).json({
        success: true,
        machines,
      });
    } catch (error) {
      console.error("Error in getAllMachines controller:", error);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลเครื่องจักร",
        error: error.message,
      });
    }
  }

  static async getMachineById(req, res) {
    try {
      const { id } = req.params;
      const machine = await StatusMachineService.getMachineById(id);

      if (!machine) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลเครื่องจักร",
        });
      }

      return res.status(200).json({
        success: true,
        data: machine,
      });
    } catch (error) {
      console.error("Error in getMachineById controller:", error);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลเครื่องจักร",
        error: error.message,
      });
    }
  }

  static async getDowntimeRecords(req, res) {
    try {
      const { machine_id, limit, start_date, end_date } = req.query;

      const filters = {
        machineId: machine_id,
        limit: limit ? parseInt(limit) : 10,
        startDate: start_date,
        endDate: end_date,
      };

      const records = await StatusMachineService.getDowntimeRecords(filters);

      return res.status(200).json({
        success: true,
        data: records,
      });
    } catch (error) {
      console.error("Error in getDowntimeRecords controller:", error);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลการหยุดทำงาน",
        error: error.message,
      });
    }
  }

  static async createDowntimeRecord(req, res) {
    try {
      const {
        machine_id,
        problem_description,
        reason_id,
        reported_by,
        technician_id,
        start_time,
        priority,
        status,
      } = req.body;

      if (!machine_id || !problem_description || !reported_by || !start_time) {
        return res.status(400).json({
          success: false,
          message:
            "กรุณาระบุข้อมูลที่จำเป็น: machine_id, problem_description, reported_by, start_time",
        });
      }

      const newRecord = await StatusMachineService.createDowntimeRecord({
        machine_id,
        problem_description,
        reason_id,
        reported_by,
        technician_id,
        start_time,
        priority: priority || "medium",
        status: status || "active",
      });

      return res.status(201).json({
        success: true,
        message: "สร้างบันทึกการหยุดทำงานสำเร็จ",
        data: newRecord,
      });
    } catch (error) {
      console.error("Error in createDowntimeRecord controller:", error);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการสร้างบันทึกการหยุดทำงาน",
        error: error.message,
      });
    }
  }

  static async updateDowntimeRecord(req, res) {
    try {
      const { id } = req.params;
      const {
        end_time,
        solution_description,
        reason_id,
        technician_id,
        status,
        downtime_minutes,
        priority,
      } = req.body;

      const updatedRecord = await StatusMachineService.updateDowntimeRecord(
        id,
        {
          end_time,
          solution_description,
          reason_id,
          technician_id,
          status,
          downtime_minutes,
          priority,
        }
      );

      if (!updatedRecord) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบบันทึกการหยุดทำงานที่ต้องการอัปเดต",
        });
      }

      return res.status(200).json({
        success: true,
        message: "อัปเดตบันทึกการหยุดทำงานสำเร็จ",
        data: updatedRecord,
      });
    } catch (error) {
      console.error("Error in updateDowntimeRecord controller:", error);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตบันทึกการหยุดทำงาน",
        error: error.message,
      });
    }
  }

  static async getDashboardSummary(req, res) {
    try {
      const { timeRange } = req.query;

      const summary = await StatusMachineService.getDashboardSummary(
        timeRange || "today"
      );

      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Error in getDashboardSummary controller:", error);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลสรุป Dashboard",
        error: error.message,
      });
    }
  }

  static async getDowntimeByReason(req, res) {
    try {
      const { timeRange } = req.query;

      const reasonsData = await StatusMachineService.getDowntimeByReason(
        timeRange || "today"
      );

      return res.status(200).json({
        success: true,
        data: reasonsData,
      });
    } catch (error) {
      console.error("Error in getDowntimeByReason controller:", error);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติตามสาเหตุ",
        error: error.message,
      });
    }
  }

  static async getDowntimeTimeSeries(req, res) {
    try {
      const { timeRange } = req.query;

      const timeSeriesData = await StatusMachineService.getDowntimeTimeSeries(
        timeRange || "today"
      );

      return res.status(200).json({
        success: true,
        data: timeSeriesData,
      });
    } catch (error) {
      console.error("Error in getDowntimeTimeSeries controller:", error);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลแนวโน้มตามเวลา",
        error: error.message,
      });
    }
  }

  static async getDowntimeStatsByMachine(req, res) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: "กรุณาระบุช่วงเวลา (start_date, end_date)",
        });
      }

      const stats = await StatusMachineService.getDowntimeStatsByMachine(
        start_date,
        end_date
      );

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error in getDowntimeStatsByMachine controller:", error);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติตามเครื่องจักร",
        error: error.message,
      });
    }
  }

  static async getTopDowntimeReasons(req, res) {
    try {
      const { start_date, end_date, limit } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: "กรุณาระบุช่วงเวลา (start_date, end_date)",
        });
      }

      const reasons = await StatusMachineService.getTopDowntimeReasons(
        start_date,
        end_date,
        limit ? parseInt(limit) : 10
      );

      return res.status(200).json({
        success: true,
        data: reasons,
      });
    } catch (error) {
      console.error("Error in getTopDowntimeReasons controller:", error);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลสาเหตุที่พบบ่อย",
        error: error.message,
      });
    }
  }

  static async updateMachineStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, updated_by } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "กรุณาระบุสถานะที่ต้องการอัพเดต",
        });
      }

      const result = await StatusMachineService.updateMachineStatus(
        id,
        status,
        updated_by
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลเครื่องจักร",
        });
      }

      return res.status(200).json({
        success: true,
        message: "อัพเดตสถานะเครื่องจักรสำเร็จ",
        data: result,
      });
    } catch (error) {
      console.error("Error in updateMachineStatus controller:", error);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการอัพเดตสถานะเครื่องจักร",
        error: error.message,
      });
    }
  }

  static async getStatusMachine(req, res) {
    try {
      const { status } = req.query;
      
      let machines = [];
      
      if (status) {
        // แปลงเป็น array เสมอเพื่อรองรับทั้ง single value และ multiple values
        const statusArray = Array.isArray(status) ? status : [status];
        machines = await StatusMachineService.getMachinesStatusDetail(statusArray);
      } else {
        machines = await StatusMachineService.getMachinesStatusDetail();
      }
  
      return res.status(200).json({
        success: true,
        machines,
      });
    } catch (error) {
      console.error("Error in getStatusMachine controller:", error);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลเครื่องจักรตามสถานะ",
        error: error.message,
      });
    }
  }
}

module.exports = StatusMachineController;
