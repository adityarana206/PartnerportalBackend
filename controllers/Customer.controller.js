const User = require("../models/Authorization.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { pool } = require("../config/db");

const VALID_ROLES = [
  "customer",
  "vendor",
  "customer_admin",
  "vendor_admin",
  "super_admin",
];

// ─── Generate Access Token (short-lived) ─────────────────
const generateToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
  } catch (error) {
    return null;
  }
};

// ─── Generate + Store Refresh Token (long-lived) ─────────
const generateRefreshToken = async (userId) => {
  try {
    const token = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );
    return token;
  } catch (err) {
    console.error("⚠️  Could not store refresh token:", err.message);
    return null;
  }
};

// ─── Register ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const role = req.body.role;

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role is required. Allowed: ${VALID_ROLES.join(", ")}`,
      });
    }

    // ─── super_admin cannot register via this API ─────────
    if (role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Super admin cannot be registered via this API",
      });
    }

    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // ─── Check duplicate ref_no ───────────────────────────
    // const refNo = req.body.partnerno
    // if (refNo) {
    //   const existing = await User.findByRefNo(refNo);
    //   if (existing) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Reference number already exists",
    //     });
    //   }
    // }

    // ─── Check duplicate email ────────────────────────────
    if (req.body.email) {
      const existingEmail = await User.findByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }
    }

    // ─── Hash password ────────────────────────────────────
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // ─── Save to DB ───────────────────────────────────────
    const user = await User.create(
      { ...req.body, password: hashedPassword },
      role,
    );

    // ─── Generate token AFTER save so id is available ─────
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email || null,
      refNo: user.ref_no || null,
      role: user.role,
    });

    if (!token) {
      return res.status(500).json({
        success: false,
        message: "Token generation failed. Registration aborted.",
      });
    }

    const refreshToken = await generateRefreshToken(user.id);

    const { password, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
      token,
      refreshToken,
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Single Login for ALL roles ───────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      refNo: user.ref_no || null,
    });

    const refreshToken = await generateRefreshToken(user.id);

    const { password: pwd, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: `${user.role} logged in successfully`,
      role: user.role,
      token,
      refreshToken,
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All ──────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const { role } = req.user;
    let users;

    if (role === "super_admin") {
      users = await User.findAll(null); // sees everyone
    } else if (role === "customer_admin") {
      users = await User.findAllByRoles(["customer", "customer_admin"]);
    } else if (role === "vendor_admin") {
      users = await User.findAllByRoles(["vendor", "vendor_admin"]);
    } else {
      users = await User.findAll(role); // own role only
    }

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by ID ────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { role, id } = req.user;

    // super_admin sees everyone
    if (role === "super_admin") {
      return res.status(200).json({ success: true, data: user });
    }

    // customer_admin sees customers
    if (
      role === "customer_admin" &&
      ["customer", "customer_admin"].includes(user.role)
    ) {
      return res.status(200).json({ success: true, data: user });
    }

    // vendor_admin sees vendors
    if (
      role === "vendor_admin" &&
      ["vendor", "vendor_admin"].includes(user.role)
    ) {
      return res.status(200).json({ success: true, data: user });
    }

    // own profile only
    if (id === user.id) {
      return res.status(200).json({ success: true, data: user });
    }

    return res.status(403).json({ success: false, message: "Access denied" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Me ───────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update ───────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { role, id } = req.user;

    if (
      role !== "super_admin" &&
      role !== "customer_admin" &&
      role !== "vendor_admin" &&
      id !== user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own profile",
      });
    }

    const updated = await User.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete ───────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const deleted = await User.delete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getAll, getById, getMe, update, remove };
