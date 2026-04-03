const { pool } = require("../config/db");
const bcService = require("../services/businessCentral.service");

// GET /api/item-categories — return from local DB
const getItemCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT code FROM item_categories ORDER BY code");
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/item-categories/sync — fetch from BC and upsert into local DB
const syncItemCategories = async (req, res) => {
  try {
    const categories = await bcService.getItemCategories();

    let inserted = 0;
    for (const cat of categories) {
      if (!cat.code) continue;
      await pool.query(
        `INSERT INTO item_categories (code, updated_at)
         VALUES ($1, NOW())
         ON CONFLICT (code) DO UPDATE SET updated_at = NOW()`,
        [cat.code]
      );
      inserted++;
    }

    res.status(200).json({
      success: true,
      message: `Synced ${inserted} item categories from Business Central`,
      count: inserted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getItemCategories, syncItemCategories };
