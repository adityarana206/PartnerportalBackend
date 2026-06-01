const { pool } = require("../config/db");

const Item = {
  async create(data, userId) {
    const query = `
      INSERT INTO item_requests (
        partner_portal_no, partner_no, batch_no, variant_code,
        item_name, description, item_category_code,
        base_unit_of_measure, net_weight, gross_weight, specifications,
        ingredients, allergen_declaration, shelf_life_days, gtin,
        ean_code, vendor_item_no, gen_prod_posting_group, vat_prod_posting_group,
        unit_price, price_currency_code,
        block, status, rejection_reason, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
      ) RETURNING *;
    `;
    const values = [
      data.partnerPortalNo, // $1  partner_portal_no
      data.partnerNo, // $2  partner_no
      data.batchNo, // $3  batch_no
      data.variantCode || null, // $4  variant_code
      data.itemName, // $5  item_name
      data.description || null, // $6  description
      data.itemCategoryCode || null, // $7  item_category_code
      data.baseUnitOfMeasure || null, // $8  base_unit_of_measure
      data.netWeight || null, // $9  net_weight
      data.grossWeight || null, // $10 gross_weight
      data.specifications || null, // $11 specifications
      data.ingredients || null, // $12 ingredients
      data.allergenDeclaration || null, // $13 allergen_declaration
      data.shelfLifeDays || null, // $14 shelf_life_days
      data.gtin || null, // $15 gtin
      data.eanCode || null, // $16 ean_code
      data.vendorItemNo || null, // $17 vendor_item_no
      data.genProdPostingGroup || null, // $18 gen_prod_posting_group
      data.vatProdPostingGroup || null, // $19 vat_prod_posting_group
      data.unitPrice || null, // $20 unit_price
      data.priceCurrencyCode || null, // $21 price_currency_code
      data.block || false, // $22 block
      data.status || "Created", // $23 status
      data.rejectionReason || null, // $24 rejection_reason
      userId || null, // $25 created_by
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

  async findByKey(partnerPortalNo, partnerNo, batchNo) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE partner_portal_no = $1 AND partner_no = $2 AND batch_no = $3",
      [partnerPortalNo, partnerNo, batchNo],
    );
    return result.rows[0] || null;
  },

  async findByPartnerPortalNo(partnerPortalNo) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE partner_portal_no = $1 ORDER BY created_at DESC",
      [partnerPortalNo],
    );
    return result.rows;
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
        variant_code=$1, item_name=$2, description=$3, item_category_code=$4,
        base_unit_of_measure=$5, net_weight=$6, gross_weight=$7,
        specifications=$8, ingredients=$9, allergen_declaration=$10,
        shelf_life_days=$11, gtin=$12, ean_code=$13,
        vendor_item_no=$14, gen_prod_posting_group=$15, vat_prod_posting_group=$16,
        unit_price=$17, price_currency_code=$18, block=$19,
        status=$20, rejection_reason=$21, updated_at=NOW()
      WHERE id=$22 RETURNING *;
    `;
    const values = [
      data.variantCode || null, // $1  variant_code
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
      data.vendorItemNo || null, // $14 vendor_item_no
      data.genProdPostingGroup || null, // $15 gen_prod_posting_group
      data.vatProdPostingGroup || null, // $16 vat_prod_posting_group
      data.unitPrice || null, // $17 unit_price
      data.priceCurrencyCode || null, // $18 price_currency_code
      data.block || false, // $19 block
      data.status || "Created", // $20 status
      data.rejectionReason || null, // $21 rejection_reason
      id, // $22 id
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async updateByKey(partnerPortalNo, partnerNo, batchNo, data) {
    const query = `
      UPDATE item_requests SET
        variant_code=$1, item_name=$2, description=$3, item_category_code=$4,
        base_unit_of_measure=$5, net_weight=$6, gross_weight=$7,
        specifications=$8, ingredients=$9, allergen_declaration=$10,
        shelf_life_days=$11, gtin=$12, ean_code=$13,
        vendor_item_no=$14, gen_prod_posting_group=$15, vat_prod_posting_group=$16,
        unit_price=$17, price_currency_code=$18, block=$19,
        status=$20, rejection_reason=$21, updated_at=NOW()
      WHERE partner_portal_no=$22 AND partner_no=$23 AND batch_no=$24 RETURNING *;
    `;
    const values = [
      data.variantCode || null,
      data.itemName,
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
      data.vendorItemNo || null,
      data.genProdPostingGroup || null,
      data.vatProdPostingGroup || null,
      data.unitPrice || null,
      data.priceCurrencyCode || null,
      data.block || false,
      data.status || "Created",
      data.rejectionReason || null,
      partnerPortalNo,
      partnerNo,
      batchNo,
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

  async patchByBatchNo(batchNo, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    
    const mapping = {
      variantCode: 'variant_code',
      itemName: 'item_name',
      description: 'description',
      itemCategoryCode: 'item_category_code',
      baseUnitOfMeasure: 'base_unit_of_measure',
      netWeight: 'net_weight',
      grossWeight: 'gross_weight',
      specifications: 'specifications',
      ingredients: 'ingredients',
      allergenDeclaration: 'allergen_declaration',
      shelfLifeDays: 'shelf_life_days',
      gtin: 'gtin',
      eanCode: 'ean_code',
      vendorItemNo: 'vendor_item_no',
      genProdPostingGroup: 'gen_prod_posting_group',
      vatProdPostingGroup: 'vat_prod_posting_group',
      unitPrice: 'unit_price',
      priceCurrencyCode: 'price_currency_code',
      block: 'block',
      status: 'status',
      rejectionReason: 'rejection_reason'
    };

    for (const [key, dbField] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${dbField}=$${idx}`);
        values.push(data[key]);
        idx++;
      }
    }

    if (fields.length === 0) {
      const res = await pool.query("SELECT * FROM item_requests WHERE batch_no=$1", [batchNo]);
      return res.rows[0] || null;
    }

    fields.push(`updated_at=NOW()`);
    values.push(batchNo);

    const query = `UPDATE item_requests SET ${fields.join(', ')} WHERE batch_no=$${idx} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async findByBatchEanUOM(batchNo, eanCode, baseUnitOfMeasure) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE batch_no=$1 AND ean_code=$2 AND base_unit_of_measure=$3 LIMIT 1",
      [batchNo, eanCode, baseUnitOfMeasure],
    );
    return result.rows[0] || null;
  },

  async patchByBatchEanUOM(batchNo, eanCode, baseUnitOfMeasure, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    const mapping = {
      variantCode: 'variant_code',         variant_code: 'variant_code',
      itemName: 'item_name',               item_name: 'item_name',
      description: 'description',
      itemCategoryCode: 'item_category_code', item_category_code: 'item_category_code',
      netWeight: 'net_weight',             net_weight: 'net_weight',
      grossWeight: 'gross_weight',         gross_weight: 'gross_weight',
      specifications: 'specifications',
      ingredients: 'ingredients',
      allergenDeclaration: 'allergen_declaration', allergen_declaration: 'allergen_declaration',
      shelfLifeDays: 'shelf_life_days',    shelf_life_days: 'shelf_life_days',
      gtin: 'gtin',
      vendorItemNo: 'vendor_item_no',      vendor_item_no: 'vendor_item_no',
      genProdPostingGroup: 'gen_prod_posting_group', gen_prod_posting_group: 'gen_prod_posting_group',
      vatProdPostingGroup: 'vat_prod_posting_group', vat_prod_posting_group: 'vat_prod_posting_group',
      unitPrice: 'unit_price',             unit_price: 'unit_price',
      priceCurrencyCode: 'price_currency_code', price_currency_code: 'price_currency_code',
      block: 'block',
      status: 'status',
      rejectionReason: 'rejection_reason', rejection_reason: 'rejection_reason',
    };

    const seen = new Set();
    for (const [key, dbField] of Object.entries(mapping)) {
      if (data[key] !== undefined && !seen.has(dbField)) {
        seen.add(dbField);
        fields.push(`${dbField}=$${idx}`);
        values.push(data[key]);
        idx++;
      }
    }

    if (fields.length === 0) {
      return await this.findByBatchEanUOM(batchNo, eanCode, baseUnitOfMeasure);
    }

    fields.push(`updated_at=NOW()`);
    values.push(batchNo, eanCode, baseUnitOfMeasure);

    const query = `UPDATE item_requests SET ${fields.join(', ')} WHERE batch_no=$${idx} AND ean_code=$${idx + 1} AND base_unit_of_measure=$${idx + 2} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async updateByBatchNo(batchNo, data) {
    const query = `
      UPDATE item_requests SET
        variant_code=$1, item_name=$2, description=$3, item_category_code=$4,
        base_unit_of_measure=$5, net_weight=$6, gross_weight=$7,
        specifications=$8, ingredients=$9, allergen_declaration=$10,
        shelf_life_days=$11, gtin=$12, ean_code=$13,
        vendor_item_no=$14, gen_prod_posting_group=$15, vat_prod_posting_group=$16,
        unit_price=$17, price_currency_code=$18, block=$19,
        status=$20, rejection_reason=$21, updated_at=NOW()
      WHERE batch_no=$22 RETURNING *;
    `;
    const values = [
      data.variantCode || null,
      data.itemName,
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
      data.vendorItemNo || null,
      data.genProdPostingGroup || null,
      data.vatProdPostingGroup || null,
      data.unitPrice || null,
      data.priceCurrencyCode || null,
      data.block || false,
      data.status || "Created",
      data.rejectionReason || null,
      batchNo,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async updateStatusByBatchNo(batchNo, status, rejectionReason = null) {
    const result = await pool.query(
      `UPDATE item_requests SET status=$1, rejection_reason=$2, updated_at=NOW()
       WHERE batch_no=$3 RETURNING *`,
      [status, rejectionReason, batchNo],
    );
    return result.rows[0] || null;
  },

  async updateBlockByBatchNo(batchNo, block) {
    const result = await pool.query(
      `UPDATE item_requests SET block=$1, updated_at=NOW()
       WHERE batch_no=$2 RETURNING *`,
      [block, batchNo],
    );
    return result.rows[0] || null;
  },

  async deleteByBatchNo(batchNo) {
    const result = await pool.query(
      "DELETE FROM item_requests WHERE batch_no = $1 RETURNING *",
      [batchNo],
    );
    return result.rows[0] || null;
  },
};

module.exports = Item;
