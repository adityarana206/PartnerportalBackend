const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { login } = require("../controllers/Login.controller");
const LoginUser = require("../models/LoginUser.model");
const User = require("../models/Authorization.model");

let currentSecretKey = null;
let secretKeyExpiry = null;


router.post("/get-register-token", (_req, res) => {
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

// ─── 5. Refresh Token ─────────────────────────────────────
// POST /api/auth/refresh-token
// Body: { refreshToken: "..." }
// Returns a new access token if the refresh token is valid and not expired.
// The frontend should call this on every page load to restore the session.
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // ─── Look up refresh token in DB ──────────────────────
    const result = await pool.query(
      `SELECT rt.*, u.id as user_id, u.name, u.email, u.role, u.ref_no
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1`,
      [refreshToken]
    );

    const row = result.rows[0];

    if (!row) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // ─── Check expiry ──────────────────────────────────────
    if (new Date() > new Date(row.expires_at)) {
      await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
      return res.status(401).json({
        success: false,
        message: "Refresh token expired. Please log in again",
      });
    }

    // ─── Issue new access token ────────────────────────────
    const newToken = jwt.sign(
      { id: row.user_id, name: row.name, email: row.email, role: row.role, refNo: row.ref_no || null },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── 6. Logout ─────────────────────────────────────────────
// POST /api/auth/logout
// Body: { refreshToken: "..." }
// Blacklists the current access token + deletes the refresh token from DB.
// Does NOT require a valid token — expired tokens are decoded without verification
// so the client is always logged out, even after token expiry.
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    let accessToken;
    if (req.headers.authorization?.startsWith("Bearer")) {
      accessToken = req.headers.authorization.split(" ")[1];
    }

    // ─── Blacklist the access token (valid or expired) ────
    if (accessToken) {
      const decoded = jwt.decode(accessToken); // decode only, no expiry check
      const userId = decoded?.id;
      const expiresAt = decoded?.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

      try {
        await pool.query(
          `INSERT INTO blacklisted_tokens (token, user_id, expires_at)
           VALUES ($1, $2, $3) ON CONFLICT (token) DO NOTHING`,
          [accessToken, userId, expiresAt]
        );
      } catch (_) {
        // blacklist table may not exist — non-fatal
      }

      // ─── Delete the refresh token from DB ───────────────
      if (refreshToken && userId) {
        await pool.query(
          "DELETE FROM refresh_tokens WHERE token = $1 AND user_id = $2",
          [refreshToken, userId]
        );
      } else if (refreshToken) {
        await pool.query(
          "DELETE FROM refresh_tokens WHERE token = $1",
          [refreshToken]
        );
      }
    } else if (refreshToken) {
      // No access token provided — delete refresh token by value alone
      await pool.query(
        "DELETE FROM refresh_tokens WHERE token = $1",
        [refreshToken]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── 7. Change Password ────────────────────────────────────
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

// ─── Create Login User ─────────────────────────────────────
// POST /api/auth/create-login-user
// Body: { partnerNo, email, password }
// Creates or updates a login_users record for an existing user.
router.post("/create-login-user", async (req, res) => {
  try {
    const { partnerNo, email, password } = req.body;

    if (!partnerNo || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "partnerNo, email, and password are required",
      });
    }

    // ─── Verify user exists by partner number ──────────────
    const user = await User.findByRefNo(partnerNo);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found for the given partnerNo",
      });
    }

    // ─── Email must match the user record ──────────────────
    if (user.email !== email) {
      return res.status(400).json({
        success: false,
        message: "Email does not match the user record",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const loginUser = await LoginUser.create({
      userId: user.id,
      partnerNo: user.ref_no,
      email: user.email,
      password: hashedPassword,
      role: user.role,
    });

    const { password: pwd, ...loginUserWithoutPassword } = loginUser;

    return res.status(201).json({
      success: true,
      message: "Login user created successfully",
      data: loginUserWithoutPassword,
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
