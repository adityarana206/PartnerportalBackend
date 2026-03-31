const VatMaster = require("../models/VatMaster.model");

const VatMasterController = {
  // ─── Create ────────────────────────────────────────────
  async create(req, res) {
    try {
      const userId = req.user?.id || null;
      const vatMaster = await VatMaster.create(req.body, userId);
      return res.status(201).json({
        success: true,
        message: "VAT Master created successfully",
        data: vatMaster,
      });
    } catch (error) {
      console.error("Create VatMaster error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create VAT Master",
        error: error.message,
      });
    }
  },

  // ─── Get All ───────────────────────────────────────────
  async getAll(req, res) {
    try {
      const { status, vatType } = req.query;

      let data;
      if (status) {
        data = await VatMaster.findByStatus(status);
      } else if (vatType) {
        data = await VatMaster.findByVatType(vatType);
      } else {
        data = await VatMaster.findAll();
      }

      return res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    } catch (error) {
      console.error("Get all VatMasters error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch VAT Masters",
        error: error.message,
      });
    }
  },

  // ─── Get by ID ─────────────────────────────────────────
  async getById(req, res) {
    try {
      const { id } = req.params;
      const vatMaster = await VatMaster.findById(id);

      if (!vatMaster) {
        return res.status(404).json({
          success: false,
          message: `VAT Master with ID ${id} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: vatMaster,
      });
    } catch (error) {
      console.error("Get VatMaster by ID error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch VAT Master",
        error: error.message,
      });
    }
  },

  // ─── Get by VAT Code ───────────────────────────────────
  async getByVatCode(req, res) {
    try {
      const { vatCode } = req.params;
      const vatMaster = await VatMaster.findByVatCode(vatCode);

      if (!vatMaster) {
        return res.status(404).json({
          success: false,
          message: `VAT Master with code "${vatCode}" not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: vatMaster,
      });
    } catch (error) {
      console.error("Get VatMaster by VAT Code error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch VAT Master by code",
        error: error.message,
      });
    }
  },

  // ─── Update ────────────────────────────────────────────
  async update(req, res) {
    try {
      const { id } = req.params;
      const existing = await VatMaster.findById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `VAT Master with ID ${id} not found`,
        });
      }

      const vatMaster = await VatMaster.update(id, req.body);
      return res.status(200).json({
        success: true,
        message: "VAT Master updated successfully",
        data: vatMaster,
      });
    } catch (error) {
      console.error("Update VatMaster error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update VAT Master",
        error: error.message,
      });
    }
  },

  // ─── Update Status Only ────────────────────────────────
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status field is required",
        });
      }

      const existing = await VatMaster.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `VAT Master with ID ${id} not found`,
        });
      }

      const vatMaster = await VatMaster.updateStatus(id, status);
      return res.status(200).json({
        success: true,
        message: "VAT Master status updated successfully",
        data: vatMaster,
      });
    } catch (error) {
      console.error("Update VatMaster status error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update VAT Master status",
        error: error.message,
      });
    }
  },

  // ─── Delete ────────────────────────────────────────────
  async delete(req, res) {
    try {
      const { id } = req.params;
      const existing = await VatMaster.findById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `VAT Master with ID ${id} not found`,
        });
      }

      const deleted = await VatMaster.delete(id);
      return res.status(200).json({
        success: true,
        message: "VAT Master deleted successfully",
        data: deleted,
      });
    } catch (error) {
      console.error("Delete VatMaster error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete VAT Master",
        error: error.message,
      });
    }
  },
};

module.exports = VatMasterController;s