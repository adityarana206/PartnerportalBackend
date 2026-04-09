const express = require("express");
const router = express.Router();
const {
  createBCUserRegister,
  getAllBCUserRegistrations,
  getBCUserRegisterById,
  updateBCUserRegisterStatus,
  deleteBCUserRegister,
} = require("../controllers/BCUserRegister.controller");
const { protect } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

// READ
router.get("/", protect, canRead("BC_USER_REGISTRATIONS"), getAllBCUserRegistrations);
router.get("/:id", protect, canRead("BC_USER_REGISTRATIONS"), getBCUserRegisterById);

// WRITE
router.post("/", createBCUserRegister);

// MODIFY
router.patch("/:id/status", protect, canModify("BC_USER_REGISTRATIONS"), updateBCUserRegisterStatus);

// DELETE
router.delete("/:id", protect, canDelete("BC_USER_REGISTRATIONS"), deleteBCUserRegister);

module.exports = router;
