const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadDocument } = require("../controllers/SharePoint.controller");
const { pool } = require("../config/db");

const upload = multer({
  storage: multer.memoryStorage(),
});

// Accepts either a valid JWT (logged-in user) or a valid invite token
const validateAccess = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authorization token required" });
  }
  const token = header.split(" ")[1];

  // Try JWT first
  try {
    const jwt = require("jsonwebtoken");
    jwt.verify(token, process.env.JWT_SECRET);
    return next(); // valid JWT — logged-in user
  } catch (_) { /* not a JWT, try invite token */ }

  // Try invite token
  try {
    const result = await pool.query(
      `SELECT * FROM registration_invites WHERE token = $1`,
      [token]
    );
    const invite = result.rows[0];
    if (!invite || invite.used || new Date() > new Date(invite.expires_at)) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    return next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/sharepoint/upload
router.post("/upload", validateAccess, upload.single("file"), uploadDocument);

module.exports = router;
