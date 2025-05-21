module.exports = {
  apps: [{
    name: "PM2-Frontend",
    script: "npm",
    args: "run dev",  // ใช้ dev mode เพื่อให้มี hot reload
    watch: [
      "src",  // ดูการเปลี่ยนแปลงในโฟลเดอร์ src
      "public"  // และ public ถ้ามี
    ],
    watch_delay: 1000,
    ignore_watch: [
      "node_modules",
      ".next",
      "*.log"
    ],
    env: {
      NODE_ENV: "development",
      PORT: 3000  // หรือพอร์ตที่คุณใช้
    }
  }]
};


