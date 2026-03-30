const NoSeries = require("../models/NoSeris.model");

const NoSeriesController = {
  // GET /api/no-series
  async getAll(req, res) {
    try {
      const series = await NoSeries.findAll();
      return res.status(200).json({ success: true, data: series });
    } catch (err) {
      console.error("[NoSeriesController.getAll]", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // GET /api/no-series/:id
  async getOne(req, res) {
    try {
      const series = await NoSeries.findById(req.params.id);
      if (!series) {
        return res.status(404).json({ success: false, message: "No series not found" });
      }
      return res.status(200).json({ success: true, data: series });
    } catch (err) {
      console.error("[NoSeriesController.getOne]", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // GET /api/no-series/code/:code
  async getByCode(req, res) {
    try {
      const series = await NoSeries.findByCode(req.params.code);
      if (!series) {
        return res.status(404).json({ success: false, message: "No series not found for this code" });
      }
      return res.status(200).json({ success: true, data: series });
    } catch (err) {
      console.error("[NoSeriesController.getByCode]", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // POST /api/no-series
  async create(req, res) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, message: "code is required" });
      }

      const existing = await NoSeries.findByCode(code);
      if (existing) {
        return res.status(409).json({ success: false, message: `Series with code '${code}' already exists` });
      }

      const userId = req.user?.id || null; // assumes auth middleware sets req.user
      const series = await NoSeries.create(req.body, userId);
      return res.status(201).json({ success: true, data: series });
    } catch (err) {
      console.error("[NoSeriesController.create]", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // PUT /api/no-series/:id
  async update(req, res) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, message: "code is required" });
      }

      const series = await NoSeries.update(req.params.id, req.body);
      if (!series) {
        return res.status(404).json({ success: false, message: "No series not found" });
      }
      return res.status(200).json({ success: true, data: series });
    } catch (err) {
      console.error("[NoSeriesController.update]", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // PATCH /api/no-series/:id/next-number
  async getNextNumber(req, res) {
    try {
      const series = await NoSeries.getNextNumber(req.params.id);
      if (!series) {
        return res.status(404).json({ success: false, message: "No series not found" });
      }

      // Mirror class method: isNearWarningLimit()
      const warning =
        series.warning_no && series.last_no_used >= series.warning_no
          ? `Warning: series is approaching its limit (${series.last_no_used} / ${series.ending_no})`
          : null;

      return res.status(200).json({
        success: true,
        nextNumber: series.last_no_used,
        ...(warning && { warning }),
        data: series,
      });
    } catch (err) {
      if (err.message === "Number series has reached its ending number") {
        return res.status(422).json({ success: false, message: err.message });
      }
      console.error("[NoSeriesController.getNextNumber]", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // PATCH /api/no-series/:id/reset
  async reset(req, res) {
    try {
      const series = await NoSeries.reset(req.params.id);
      if (!series) {
        return res.status(404).json({ success: false, message: "No series not found" });
      }
      return res.status(200).json({ success: true, message: "Series reset successfully", data: series });
    } catch (err) {
      console.error("[NoSeriesController.reset]", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // DELETE /api/no-series/:id
  async delete(req, res) {
    try {
      const series = await NoSeries.delete(req.params.id);
      if (!series) {
        return res.status(404).json({ success: false, message: "No series not found" });
      }
      return res.status(200).json({ success: true, message: "No series deleted", data: series });
    } catch (err) {
      console.error("[NoSeriesController.delete]", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
};

module.exports = NoSeriesController;