const express = require("express");
const router = express.Router();
const {
  generateInvite,
  verifyInvite,
  createBCUserRegister,
  getAllBCUserRegistrations,
  getBCUserRegisterById,
  updateBCUserRegisterStatus,
  deleteBCUserRegister,
  getRegistrationOptions,
} = require("../controllers/BCUserRegister.controller");
const { protect } = require("../middleware/auth.middleware");

// OPTIONS (public — for dropdowns)
router.get("/options", getRegistrationOptions);

// INVITE (admin only)
router.post("/invite", generateInvite);
router.get("/invite/verify", verifyInvite);

// READ
router.get("/", protect, getAllBCUserRegistrations);
router.get("/:id", protect, getBCUserRegisterById);

// WRITE (public — token validated inside controller)
router.post("/", createBCUserRegister);

// MODIFY
router.patch("/:id/status", protect, updateBCUserRegisterStatus);

// DELETE
router.delete("/:id", protect, deleteBCUserRegister);

module.exports = router;
