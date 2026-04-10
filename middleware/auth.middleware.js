const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const VALID_ROLES = [
  "customer",
  "vendor",
  "customer_admin",
  "vendor_admin",
  "super_admin",
  "company_admin",
];

// ─── Protect any logged in user ───────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    // ─── Reject blacklisted tokens ────────────────────────
    try {
      const blacklisted = await pool.query(
        "SELECT 1 FROM blacklisted_tokens WHERE token = $1 AND expires_at > NOW()",
        [token]
      );
      if (blacklisted.rows.length > 0) {
        return res.status(401).json({
          success: false,
          message: "Token has been invalidated. Please log in again",
        });
      }
    } catch (err) {
      // Table may not exist yet — skip blacklist check, do not block the request
      console.error("⚠️  Blacklist check skipped:", err.message);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token; // attach raw token for logout use
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

// ─── Protect Registration ──────────────────────────────────
const protectRegister = (req, res, next) => {
  try {
    let token;

    if (req.headers["x-register-token"]) {
      token = req.headers["x-register-token"];
    } else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Registration token required. Call /api/auth/get-register-token first",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "registration") {
      return res.status(403).json({
        success: false,
        message: "Invalid token purpose",
      });
    }

    const {
      getCurrentSecretKey,
      getSecretKeyExpiry,
    } = require("../routes/auth.routes");
    const currentKey = getCurrentSecretKey();
    const expiry = getSecretKeyExpiry();

    if (!currentKey) {
      return res.status(401).json({
        success: false,
        message:
          "No active secret key. Call /api/auth/get-register-token first",
      });
    }

    if (Date.now() > expiry) {
      return res.status(401).json({
        success: false,
        message:
          "Secret key expired. Call /api/auth/get-register-token for a new one",
      });
    }

    if (decoded.secretKey !== currentKey) {
      return res.status(401).json({
        success: false,
        message:
          "Secret key mismatch. Call /api/auth/get-register-token for a new one",
      });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message:
          "Registration token expired. Call /api/auth/get-register-token for a new one",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid registration token",
    });
  }
};

// ─── Authorize specific roles ──────────────────────────────
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Allowed roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

// ─── Super Admin only ──────────────────────────────────────
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super admin only",
    });
  }
  next();
};

// ─── Any admin ─────────────────────────────────────────────
const isAnyAdmin = (req, res, next) => {
  if (
    !["customer_admin", "vendor_admin", "super_admin"].includes(req.user.role)
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin access required",
    });
  }
  next();
};

// ─── Customer side ─────────────────────────────────────────
const isCustomerSide = (req, res, next) => {
  if (!["customer", "customer_admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Customer access required",
    });
  }
  next();
};

// ─── Vendor side ───────────────────────────────────────────
const isVendorSide = (req, res, next) => {
  if (!["vendor", "vendor_admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Vendor access required",
    });
  }
  next();
};

module.exports = {
  protect,
  protectRegister,
  authorizeRoles,
  isSuperAdmin,
  isAnyAdmin,
  isCustomerSide,
  isVendorSide,
};
