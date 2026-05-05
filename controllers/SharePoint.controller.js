const { uploadToSharePoint } = require("../config/sharepoint");

/**
 * POST /api/sharepoint/upload
 * Body: multipart/form-data
 *   - file: the file to upload
 *   - folder (optional): subfolder path inside SharePoint root
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    const folder = req.body.folder || "";
    const result = await uploadToSharePoint(req.file.buffer, req.file.originalname, folder);

    return res.status(200).json({
      success: true,
      message: "File uploaded to SharePoint successfully",
      data: {
        name: result.name,
        id: result.id,
        webUrl: result.webUrl,
        size: result.size,
        createdDateTime: result.createdDateTime,
      },
    });
  } catch (error) {
    const detail = error.response?.data || error.message;
    console.error("SharePoint upload error:", JSON.stringify(detail, null, 2));
    return res.status(500).json({ success: false, message: error.response?.data?.error?.message || error.message, detail });
  }
};

module.exports = { uploadDocument };
