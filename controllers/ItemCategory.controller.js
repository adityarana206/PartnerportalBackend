const { pool } = require("../config/db");
const bcService = require("../services/businessCentral.service");

// GET /api/item-categories — return from local DB
const getItemCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT code, description FROM item_categories ORDER BY code");
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/item-categories/bc — fetch live from Business Central
const getItemCategoriesFromBC = async (req, res) => {
  try {
    const categories = await bcService.getItemCategories();
    res.status(200).json({ success: true, count: categories.length, data: categories });
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
        `INSERT INTO item_categories (code, description, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (code) DO UPDATE SET description = $2, updated_at = NOW()`,
        [cat.code, cat.description || null]
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

// DELETE /api/item-categories/:code — delete a category from local DB
const deleteItemCategory = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ success: false, message: "Category code is required" });
    }
    const result = await pool.query("DELETE FROM item_categories WHERE code = $1 RETURNING *", [code]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: `Category '${code}' not found` });
    }
    res.status(200).json({ success: true, message: `Category '${code}' deleted`, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getItemCategories, getItemCategoriesFromBC, syncItemCategories, deleteItemCategory };
