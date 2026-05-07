const { uploadToSharePoint, getSharePointToken } = require("../config/sharepoint");

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

// GET /api/sharepoint/token?folder=DeliveryOrders&fileName=packing_list.pdf
const getUploadToken = async (req, res) => {
  try {
    const { folder = "", fileName } = req.query;
    if (!fileName) {
      return res.status(400).json({ success: false, message: "fileName is required" });
    }

    const token = await getSharePointToken();
    const rootUrl = process.env.SP_ROOT_URL;
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    const uploadUrl = `${rootUrl}${filePath}:/content`;

    return res.status(200).json({
      success: true,
      data: {
        token,
        uploadUrl,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadDocument, getUploadToken };
