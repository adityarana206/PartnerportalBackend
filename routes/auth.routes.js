const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { login } = require("../controllers/Customer.controller");

let currentSecretKey = null;
let secretKeyExpiry = null;


router.post("/get-register-token", (req, res) => {
  try {
    currentSecretKey = crypto.randomBytes(32).toString("hex");
    secretKeyExpiry = Date.now() + 60 * 60 * 1000;

    const registerToken = jwt.sign(
      { purpose: "registration", secretKey: currentSecretKey },
      process.env.JWT_SECRET,
      { expiresIn: "60m" },
    );

    res.status(200).json({
      success: true,
      message: "Register token generated. Valid for 60 minutes.",
      registerToken,
      expiresAt: new Date(secretKeyExpiry),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.post("/login", login);


router.post("/create-super-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

   
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // ─── Check if super admin already exists ───────────────
    const existing = await pool.query(
      "SELECT * FROM users WHERE role = 'super_admin'",
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Super admin already exists",
      });
    }

    // ─── Check duplicate email ─────────────────────────────
    const existingEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'super_admin') RETURNING *`,
      [name, email, hashedPassword],
    );

    const { password: pwd, ...superAdminWithoutPassword } = result.rows[0];

    res.status(201).json({
      success: true,
      message: "Super admin created successfully",
      data: superAdminWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── 4. Get Current User Info from Token ──────────────────
// POST /api/auth/verify-token
// Verify if token is valid and return user info
router.post("/verify-token", async (req, res) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ─── Get fresh user data from DB ──────────────────────
    const result = await pool.query(
      `SELECT id, ref_no, name, email, role, created_at
       FROM users WHERE id = $1`,
      [decoded.id],
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
      role: result.rows[0].role,
      data: result.rows[0],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});

// ─── 5. Change Password ────────────────────────────────────
// POST /api/auth/change-password
router.post("/change-password", async (req, res) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    // ─── Get user with password ────────────────────────────
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      decoded.id,
    ]);

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ─── Verify old password ───────────────────────────────
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // ─── Hash and save new password ────────────────────────
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, decoded.id],
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  router,
  getCurrentSecretKey: () => currentSecretKey,
  getSecretKeyExpiry: () => secretKeyExpiry,
};
