const { pool } = require("../config/db");

const Item = {
  async create(data, userId) {
    const query = `
      INSERT INTO item_requests (
        batch_no, item_name, description, item_category_code,
        base_unit_of_measure, net_weight, gross_weight, specifications,
        ingredients, allergen_declaration, shelf_life_days, gtin,
        ean_code, unit_price, price_currency_code, partner_no,
        block, status, rejection_reason, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
      ) RETURNING *;
    `;
    const values = [
      data.batchNo || null, // $1  batch_no
      data.itemName, // $2  item_name
      data.description || null, // $3  description
      data.itemCategoryCode || null, // $4  item_category_code
      data.baseUnitOfMeasure || null, // $5  base_unit_of_measure
      data.netWeight || null, // $6  net_weight
      data.grossWeight || null, // $7  gross_weight
      data.specifications || null, // $8  specifications
      data.ingredients || null, // $9  ingredients
      data.allergenDeclaration || null, // $10 allergen_declaration
      data.shelfLifeDays || null, // $11 shelf_life_days
      data.gtin || null, // $12 gtin
      data.eanCode || null, // $13 ean_code
      data.unitPrice || null, // $14 unit_price
      data.priceCurrencyCode || null, // $15 price_currency_code
      data.partnerNo || null, // $16 partner_no
      data.block || false, // $17 block
      data.status || "Created", // $18 status
      data.rejectionReason || null, // $19 rejection_reason
      userId || null, // $20 created_by
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      "SELECT * FROM item_requests ORDER BY created_at DESC",
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  },

  async findByPartnerNo(partnerNo) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo],
    );
    return result.rows;
  },

  async findByBatchNo(batchNo) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE batch_no = $1",
      [batchNo],
    );
    return result.rows[0] || null;
  },

  async checkPartnerExists(partnerNo) {
    const result = await pool.query(
      "SELECT 1 FROM users WHERE ref_no = $1",
      [partnerNo],
    );
    return result.rows.length > 0;
  },

  async findByStatus(status) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE status = $1 ORDER BY created_at DESC",
      [status],
    );
    return result.rows;
  },

  async update(id, data) {
    const query = `
      UPDATE item_requests SET
        batch_no=$1, item_name=$2, description=$3, item_category_code=$4,
        base_unit_of_measure=$5, net_weight=$6, gross_weight=$7,
        specifications=$8, ingredients=$9, allergen_declaration=$10,
        shelf_life_days=$11, gtin=$12, ean_code=$13, unit_price=$14,
        price_currency_code=$15, partner_no=$16, block=$17,
        status=$18, rejection_reason=$19, updated_at=NOW()
      WHERE id=$20 RETURNING *;
    `;
    const values = [
      data.batchNo || null, // $1  batch_no
      data.itemName, // $2  item_name
      data.description || null, // $3  description
      data.itemCategoryCode || null, // $4  item_category_code
      data.baseUnitOfMeasure || null, // $5  base_unit_of_measure
      data.netWeight || null, // $6  net_weight
      data.grossWeight || null, // $7  gross_weight
      data.specifications || null, // $8  specifications
      data.ingredients || null, // $9  ingredients
      data.allergenDeclaration || null, // $10 allergen_declaration
      data.shelfLifeDays || null, // $11 shelf_life_days
      data.gtin || null, // $12 gtin
      data.eanCode || null, // $13 ean_code
      data.unitPrice || null, // $14 unit_price
      data.priceCurrencyCode || null, // $15 price_currency_code
      data.partnerNo || null, // $16 partner_no
      data.block || false, // $17 block
      data.status || "Created", // $18 status
      data.rejectionReason || null, // $19 rejection_reason
      id, // $20 id
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async updateStatus(id, status, rejectionReason = null) {
    const result = await pool.query(
      `UPDATE item_requests SET status=$1, rejection_reason=$2, updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [status, rejectionReason, id],
    );
    return result.rows[0] || null;
  },

  async updateBlock(id, block) {
    const result = await pool.query(
      `UPDATE item_requests SET block=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [block, id],
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM item_requests WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = Item;
