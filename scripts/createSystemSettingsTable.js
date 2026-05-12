const SystemSettings = require("../models/SystemSettings.model");

(async () => {
  try {
    console.log("Creating system_settings table...");
    await SystemSettings.createTable();
    console.log("✅ system_settings table created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();
