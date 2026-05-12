const SystemSettings = require("../models/SystemSettings.model");

const getSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.get();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTheme = async (req, res) => {
  try {
    const { primary, secondary } = req.body;

    if (!primary || !secondary) {
      return res.status(400).json({
        success: false,
        message: "Both primary and secondary colors are required",
      });
    }

    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (!hexRegex.test(primary) || !hexRegex.test(secondary)) {
      return res.status(400).json({
        success: false,
        message: "Colors must be valid hex codes (e.g., #1976d2)",
      });
    }

    const settings = await SystemSettings.updateTheme(primary, secondary, req.user.id);
    res.status(200).json({
      success: true,
      message: "Theme updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No logo file provided" });
    }

    const base64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    const settings = await SystemSettings.updateLogo(dataUri, req.user.id);
    res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteLogo = async (req, res) => {
  try {
    const settings = await SystemSettings.deleteLogo(req.user.id);
    res.status(200).json({
      success: true,
      message: "Logo deleted successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSettings,
  updateTheme,
  uploadLogo,
  deleteLogo,
};
