const PurchasePrice = require("../models/PurchasePrice.model");
const { pool } = require("../config/db");
const { isValidId, sanitizeString } = require("../utils/validation.utils");

// ─── Helper: fetch item data from item_requests ───────────
const fetchItemData = async (batchNo, partnerNo) => {
  const result = await pool.query(
    `SELECT batch_no, item_name, description, item_category_code,
            base_unit_of_measure, net_weight, gross_weight,
            specifications, ingredients, allergen_declaration,
            shelf_life_days, gtin, ean_code, unit_price, price_currency_code
     FROM item_requests
     WHERE batch_no = $1 AND partner_no = $2 AND status = 'Approved' AND block = false`,
    [batchNo, partnerNo]
  );
  return result.rows[0] || null;
};

const getApprovedItemsForPartner = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    if (!partnerNo)
      return res.status(400).json({ success: false, message: "Invalid partner number" });
    const result = await pool.query(
      `SELECT batch_no, item_name, description, item_category_code,
              base_unit_of_measure, net_weight, gross_weight,
              specifications, ingredients, allergen_declaration,
              shelf_life_days, gtin, ean_code, unit_price, price_currency_code
       FROM item_requests
       WHERE partner_no = $1 AND status = 'Approved' AND block = false
       ORDER BY item_name`,
      [partnerNo]
    );
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApprovedItemDetail = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    const batchNo = sanitizeString(req.params.batchNo);
    const item = await fetchItemData(batchNo, partnerNo);
    if (!item)
      return res.status(404).json({ success: false, message: "Approved item not found" });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPurchasePrices = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.query.partnerNo);
    const prices = partnerNo
      ? await PurchasePrice.findByPartnerNo(partnerNo)
      : await PurchasePrice.findAll();
    res.status(200).json({ success: true, count: prices.length, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPurchasePriceById = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const price = await PurchasePrice.findById(req.params.id);
    if (!price)
      return res.status(404).json({ success: false, message: "Purchase price not found" });
    res.status(200).json({ success: true, data: price });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPurchasePrice = async (req, res) => {
  try {
    if (!req.body.batchNo)
      return res.status(400).json({ success: false, message: "Item (batch number) is required" });
    if (req.body.newPrice === undefined || req.body.newPrice === null)
      return res.status(400).json({ success: false, message: "New price is required" });

    const userId = req.user ? req.user.id : null;
    const partnerNo = req.body.partnerNo || (req.user ? req.user.refNo : null);

    // ─── Auto-populate item fields from item_requests ─────
    const itemData = await fetchItemData(req.body.batchNo, partnerNo);
    if (!itemData)
      return res.status(400).json({ success: false, message: `No approved item found with batch number '${req.body.batchNo}' for this partner` });

    const payload = {
      ...itemData,
      // map item fields to camelCase
      batchNo: itemData.batch_no,
      itemName: itemData.item_name,
      itemCategoryCode: itemData.item_category_code,
      baseUnitOfMeasure: itemData.base_unit_of_measure,
      netWeight: itemData.net_weight,
      grossWeight: itemData.gross_weight,
      allergenDeclaration: itemData.allergen_declaration,
      shelfLifeDays: itemData.shelf_life_days,
      eanCode: itemData.ean_code,
      unitOfMeasureCode: itemData.base_unit_of_measure,
      currencyCode: req.body.currencyCode || itemData.price_currency_code || "AED",
      oldPrice: itemData.unit_price || 0,
      // price-specific fields from request
      newPrice: req.body.newPrice,
      effectiveDate: req.body.effectiveDate || null,
      endingDate: req.body.endingDate || null,
      minimumQuantity: req.body.minimumQuantity || 1,
      partnerNo,
      status: req.body.status || "_x0020_",
      rejectionReason: req.body.rejectionReason || null,
    };

    const price = await PurchasePrice.create(payload, userId);
    res.status(201).json({ success: true, message: "Purchase price created successfully", data: price });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePurchasePrice = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const existing = await PurchasePrice.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Purchase price not found" });

    const partnerNo = req.body.partnerNo || existing.partner_no;
    const batchNo = req.body.batchNo || existing.batch_no;

    // ─── Re-sync item fields if batchNo changed ───────────
    let itemData = null;
    if (batchNo) {
      itemData = await fetchItemData(batchNo, partnerNo);
    }

    const payload = {
      batchNo,
      itemName: itemData?.item_name || existing.item_name,
      description: itemData?.description || existing.description,
      itemCategoryCode: itemData?.item_category_code || existing.item_category_code,
      baseUnitOfMeasure: itemData?.base_unit_of_measure || existing.base_unit_of_measure,
      netWeight: itemData?.net_weight || existing.net_weight,
      grossWeight: itemData?.gross_weight || existing.gross_weight,
      specifications: itemData?.specifications || existing.specifications,
      ingredients: itemData?.ingredients || existing.ingredients,
      allergenDeclaration: itemData?.allergen_declaration || existing.allergen_declaration,
      shelfLifeDays: itemData?.shelf_life_days || existing.shelf_life_days,
      gtin: itemData?.gtin || existing.gtin,
      eanCode: itemData?.ean_code || existing.ean_code,
      newPrice: req.body.newPrice ?? existing.new_price,
      oldPrice: itemData?.unit_price || existing.old_price,
      effectiveDate: req.body.effectiveDate || existing.effective_date,
      endingDate: req.body.endingDate || existing.ending_date,
      currencyCode: req.body.currencyCode || itemData?.price_currency_code || existing.currency_code,
      unitOfMeasureCode: itemData?.base_unit_of_measure || existing.unit_of_measure_code,
      minimumQuantity: req.body.minimumQuantity || existing.minimum_quantity,
      partnerNo,
      status: req.body.status || existing.status,
      rejectionReason: req.body.rejectionReason || existing.rejection_reason,
    };

    const updated = await PurchasePrice.update(req.params.id, payload);
    res.status(200).json({ success: true, message: "Purchase price updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePurchasePrice = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const deleted = await PurchasePrice.delete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Purchase price not found" });
    res.status(200).json({ success: true, message: "Purchase price deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllPurchasePrices,
  getPurchasePriceById,
  createPurchasePrice,
  updatePurchasePrice,
  deletePurchasePrice,
  getApprovedItemsForPartner,
  getApprovedItemDetail,
};
