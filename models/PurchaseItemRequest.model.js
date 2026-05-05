const { pool } = require("../config/db");

const PurchaseItemRequest = {
  async create(data, userId) {
    const query = `
      INSERT INTO purchase_item_requests (
        batch_no, item_name, description, item_category_code,
        base_unit_of_measure, purch_unit_of_measure, net_weight, gross_weight,
        specifications, ingredients, allergen_declaration, shelf_life_days,
        gtin, ean_code, upc_code, purchase_unit_price, price_currency_code,
        partner_no, status, rejection_reason, price_effective_date, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
      ) RETURNING *;
    `;
    const values = [
      data.batchNo,
      data.itemName,
      data.description || null,
      data.itemCategoryCode || null,
      data.baseUnitOfMeasure || null,
      data.purchUnitOfMeasure || null,
      data.netWeight || null,
      data.grossWeight || null,
      data.specifications || null,
      data.ingredients || null,
      data.allergenDeclaration || null,
      data.shelfLifeDays || 0,
      data.gtin || null,
      data.eanCode || null,
      data.UPCCode || null,
      data.purchaseUnitPrice || 0,
      data.priceCurrencyCode || "AED",
      data.partnerNo,
      data.status || "Submitted",
      data.rejectionReason || null,
      data.PriceEffectiveDate || null,
      userId || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      "SELECT * FROM purchase_item_requests ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM purchase_item_requests WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },

  async findByPartnerNo(partnerNo) {
    const result = await pool.query(
      "SELECT * FROM purchase_item_requests WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo]
    );
    return result.rows;
  },

  async findByStatus(status) {
    const result = await pool.query(
      "SELECT * FROM purchase_item_requests WHERE status = $1 ORDER BY created_at DESC",
      [status]
    );
    return result.rows;
  },

  async findByBatchNo(batchNo) {
    const result = await pool.query(
      "SELECT * FROM purchase_item_requests WHERE batch_no = $1",
      [batchNo]
    );
    return result.rows[0] || null;
  },

  async update(id, data) {
    const query = `
      UPDATE purchase_item_requests SET
        batch_no=$1, item_name=$2, description=$3, item_category_code=$4,
        base_unit_of_measure=$5, purch_unit_of_measure=$6, net_weight=$7, gross_weight=$8,
        specifications=$9, ingredients=$10, allergen_declaration=$11, shelf_life_days=$12,
        gtin=$13, ean_code=$14, upc_code=$15, purchase_unit_price=$16,
        price_currency_code=$17, partner_no=$18, status=$19,
        rejection_reason=$20, price_effective_date=$21, updated_at=NOW()
      WHERE id=$22 RETURNING *;
    `;
    const values = [
      data.batchNo,
      data.itemName,
      data.description || null,
      data.itemCategoryCode || null,
      data.baseUnitOfMeasure || null,
      data.purchUnitOfMeasure || null,
      data.netWeight || null,
      data.grossWeight || null,
      data.specifications || null,
      data.ingredients || null,
      data.allergenDeclaration || null,
      data.shelfLifeDays || 0,
      data.gtin || null,
      data.eanCode || null,
      data.UPCCode || null,
      data.purchaseUnitPrice || 0,
      data.priceCurrencyCode || "AED",
      data.partnerNo,
      data.status || "Submitted",
      data.rejectionReason || null,
      data.PriceEffectiveDate || null,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async updateStatus(id, status, rejectionReason = null) {
    const result = await pool.query(
      `UPDATE purchase_item_requests SET status=$1, rejection_reason=$2, updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [status, rejectionReason, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM purchase_item_requests WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = PurchaseItemRequest;
