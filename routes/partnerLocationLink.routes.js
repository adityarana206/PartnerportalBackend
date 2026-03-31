const express = require("express");
const router = express.Router();
const {
  createPartnerLocationLink,
  getAllPartnerLocationLinks,
  getPartnerLocationLinkById,
  getLinksByPartner,
  getDefaultLinkByPartner,
  updatePartnerLocationLink,
  updateBlockStatus,
  updateDefaultStatus,
  deletePartnerLocationLink,
} = require("../controllers/PartnerLocationLink.controller");
const { protect, authorizeRoles, protectRegister } = require("../middleware/auth.middleware");

router.post(
  "/",
  protect,
  authorizeRoles(
    "customer",
    "vendor",
    "customer_admin",
    "vendor_admin",
    "super_admin",
  ),
  createPartnerLocationLink,
);
router.post(
  "/businesscentral",
  protectRegister,
  
  createPartnerLocationLink,
);
router.get(
  "/",
  protect,
  authorizeRoles(
    "customer",
    "vendor",
    "customer_admin",
    "vendor_admin",
    "super_admin",
  ),
  getAllPartnerLocationLinks,
);
router.get(
  "/partner/:partnerNo",
  protect,
  authorizeRoles(
    "customer",
    "vendor",
    "customer_admin",
    "vendor_admin",
    "super_admin",
  ),
  getLinksByPartner,
);
router.get(
  "/partner/:partnerNo/default",
  protect,
  authorizeRoles(
    "customer",
    "vendor",
    "customer_admin",
    "vendor_admin",
    "super_admin",
  ),
  getDefaultLinkByPartner,
);
router.get(
  "/:id",
  protect,
  authorizeRoles(
    "customer",
    "vendor",
    "customer_admin",
    "vendor_admin",
    "super_admin",
  ),
  getPartnerLocationLinkById,
);
router.put(
  "/:id",
  protect,
  authorizeRoles(
    "customer",
    "vendor",
    "customer_admin",
    "vendor_admin",
    "super_admin",
  ),
  updatePartnerLocationLink,
);

// ─── Admin Only ───────────────────────────────────────────
router.patch(
  "/:id/block",
  protect,
  authorizeRoles("customer_admin", "vendor_admin", "super_admin"),
  updateBlockStatus,
);
router.patch(
  "/:id/default",
  protect,
  authorizeRoles("customer_admin", "vendor_admin", "super_admin"),
  updateDefaultStatus,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("customer_admin", "vendor_admin", "super_admin"),
  deletePartnerLocationLink,
);

module.exports = router;
