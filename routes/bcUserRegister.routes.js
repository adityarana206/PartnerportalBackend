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
} = require("../controllers/BCUserRegister.controller");
const { protect } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

// INVITE (admin only)
router.post("/invite", generateInvite);
router.get("/invite/verify", verifyInvite);

// READ
router.get("/", protect, canRead("BC_USER_REGISTRATIONS"), getAllBCUserRegistrations);
router.get("/:id", protect, canRead("BC_USER_REGISTRATIONS"), getBCUserRegisterById);

// WRITE (public — token validated inside controller)
router.post("/", createBCUserRegister);

// MODIFY
router.patch("/:id/status", protect, canModify("BC_USER_REGISTRATIONS"), updateBCUserRegisterStatus);

// DELETE
router.delete("/:id", protect, canDelete("BC_USER_REGISTRATIONS"), deleteBCUserRegister);

module.exports = router;
