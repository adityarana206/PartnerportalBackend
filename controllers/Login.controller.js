const User = require("../models/Authorization.model");
const LoginUser = require("../models/LoginUser.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { pool } = require("../config/db");

const generateToken = ({ id, name, email, role, refNo }) => {
  try {
    return jwt.sign({ id, name, email, role, refNo }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
  } catch (error) {
    return null;
  }
};

const generateRefreshToken = async (userId) => {
  try {
    const token = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    let loginUser = await LoginUser.findByEmail(email);

    if (!loginUser) {
      const directUser = await User.findByEmailWithPassword(email);
      if (!directUser) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }
      const isMatch = await bcrypt.compare(password, directUser.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }
      await LoginUser.create({ userId: directUser.id, partnerNo: directUser.ref_no || null, email: directUser.email, password: directUser.password, role: directUser.role });
      loginUser = await LoginUser.findByEmail(email);
    }

    const isMatch = await bcrypt.compare(password, loginUser.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = await User.findById(loginUser.user_id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User profile not found",
      });
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: loginUser.role,
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

module.exports = { login };
