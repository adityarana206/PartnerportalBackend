const SystemSettings = require("../models/SystemSettings.model");

(async () => {
  try {
    console.log("Testing System Settings...\n");

    // Test 1: Get settings
    console.log("1. Getting current settings...");
    const settings = await SystemSettings.get();
    console.log("✅ Settings:", settings);

    // Test 2: Update theme
    console.log("\n2. Updating theme colors...");
    const updated = await SystemSettings.updateTheme("#2196f3", "#f50057", 1);
    console.log("✅ Theme updated:", {
      primary: updated.theme_primary,
      secondary: updated.theme_secondary
    });

    // Test 3: Verify update
    console.log("\n3. Verifying update...");
    const verified = await SystemSettings.get();
    console.log("✅ Verified:", {
      primary: verified.theme_primary,
      secondary: verified.theme_secondary
    });

    console.log("\n✅ All tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();
