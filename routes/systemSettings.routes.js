const express = require("express");
const multer = require("multer");
const router = express.Router();
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");
const { getSettings, updateTheme, uploadLogo, deleteLogo } = require("../controllers/SystemSettings.controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.get("/", getSettings);
router.put("/theme", protect, isSuperAdmin, updateTheme);
router.post("/logo", protect, isSuperAdmin, upload.single("logo"), uploadLogo);
router.delete("/logo", protect, isSuperAdmin, deleteLogo);

module.exports = router;
