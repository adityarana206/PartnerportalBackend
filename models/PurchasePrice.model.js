const { pool } = require("../config/db");

const PurchasePrice = {
  async findAll() {
    const result = await pool.query(
      "SELECT * FROM purchase_prices ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM purchase_prices WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },

  async findByPartnerNo(partnerNo) {
    const result = await pool.query(
      "SELECT * FROM purchase_prices WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo]
    );
    return result.rows;
  },

  async create(data, userId) {
    const result = await pool.query(
      `INSERT INTO purchase_prices (
        batch_no, item_name, description, item_category_code,
        base_unit_of_measure, net_weight, gross_weight,
        specifications, ingredients, allergen_declaration,
        shelf_life_days, gtin, ean_code,
        new_price, old_price, effective_date, ending_date,
        currency_code, unit_of_measure_code, minimum_quantity,
        partner_no, status, rejection_reason, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
        $14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
      ) RETURNING *`,
      [
        data.batchNo || null,
        data.itemName || null,
        data.description || null,
        data.itemCategoryCode || null,
        data.baseUnitOfMeasure || null,
        data.netWeight || null,
        data.grossWeight || null,
        data.specifications || null,
        data.ingredients || null,
        data.allergenDeclaration || null,
        data.shelfLifeDays || null,
        data.gtin || null,
        data.eanCode || null,
        data.newPrice,
        data.oldPrice || 0,
        data.effectiveDate || null,
        data.endingDate || null,
        data.currencyCode || "AED",
        data.unitOfMeasureCode || null,
        data.minimumQuantity || 1,
        data.partnerNo || null,
        data.status || "_x0020_",
        data.rejectionReason || null,
        userId || null,
      ]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE purchase_prices SET
        batch_no=$1, item_name=$2, description=$3, item_category_code=$4,
        base_unit_of_measure=$5, net_weight=$6, gross_weight=$7,
        specifications=$8, ingredients=$9, allergen_declaration=$10,
        shelf_life_days=$11, gtin=$12, ean_code=$13,
        new_price=$14, old_price=$15, effective_date=$16, ending_date=$17,
        currency_code=$18, unit_of_measure_code=$19, minimum_quantity=$20,
        partner_no=$21, status=$22, rejection_reason=$23, updated_at=NOW()
       WHERE id=$24 RETURNING *`,
      [
        data.batchNo || null,
        data.itemName || null,
        data.description || null,
        data.itemCategoryCode || null,
        data.baseUnitOfMeasure || null,
        data.netWeight || null,
        data.grossWeight || null,
        data.specifications || null,
        data.ingredients || null,
        data.allergenDeclaration || null,
        data.shelfLifeDays || null,
        data.gtin || null,
        data.eanCode || null,
        data.newPrice,
        data.oldPrice || 0,
        data.effectiveDate || null,
        data.endingDate || null,
        data.currencyCode || "AED",
        data.unitOfMeasureCode || null,
        data.minimumQuantity || 1,
        data.partnerNo || null,
        data.status || "_x0020_",
        data.rejectionReason || null,
        id,
      ]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM purchase_prices WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = PurchasePrice;
