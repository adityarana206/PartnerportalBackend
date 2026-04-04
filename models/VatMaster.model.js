const { pool } = require("../config/db");

const VatMaster = {
  // ─── Create VAT Master ─────────────────────────────────
  async create(data, userId) {
    const query = `
      INSERT INTO vat_masters (
        vat_code, description, vat_percent,
        vat_type, is_inclusive, status, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7
      ) RETURNING *;
    `;
    const values = [
      data.vatCode       || null,
      data.description   || null,
      data.vatPercent    ?? 0,
      data.vatType       || null,
      data.isInclusive   ?? false,
      data.status        || "Active",
      userId             || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // ─── Find All ──────────────────────────────────────────
  async findAll() {
    const result = await pool.query(
      "SELECT * FROM vat_masters ORDER BY created_at DESC"
    );
    return result.rows;
  },

  // ─── Find by ID ────────────────────────────────────────
  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM vat_masters WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },

  // ─── Find by VAT Code ──────────────────────────────────
  async findByVatCode(vatCode) {
    const result = await pool.query(
      "SELECT * FROM vat_masters WHERE vat_code = $1",
      [vatCode]
    );
    return result.rows[0] || null;
  },

  // ─── Find by Status ────────────────────────────────────
  async findByStatus(status) {
    const result = await pool.query(
      "SELECT * FROM vat_masters WHERE status = $1 ORDER BY created_at DESC",
      [status]
    );
    return result.rows;
  },

  // ─── Find by VAT Type ──────────────────────────────────
  async findByVatType(vatType) {
    const result = await pool.query(
      "SELECT * FROM vat_masters WHERE vat_type = $1 ORDER BY created_at DESC",
      [vatType]
    );
    return result.rows;
  },

  // ─── Update ────────────────────────────────────────────
  async update(id, data) {
    const query = `
      UPDATE vat_masters SET
        vat_code=$1, description=$2, vat_percent=$3,
        vat_type=$4, is_inclusive=$5, status=$6,
        updated_at=NOW()
      WHERE id=$7 RETURNING *;
    `;
    const values = [
      data.vatCode     || null,
      data.description || null,
      data.vatPercent  ?? 0,
      data.vatType     || null,
      data.isInclusive ?? false,
      data.status      || "Active",
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // ─── Update Status Only ────────────────────────────────
  async updateStatus(id, status, isInclusive) {
    const fields = [];
    const values = [];
    let i = 1;
    if (status !== undefined) { fields.push(`status=$${i++}`); values.push(status); }
    if (isInclusive !== undefined) { fields.push(`is_inclusive=$${i++}`); values.push(isInclusive); }
    fields.push(`updated_at=NOW()`);
    values.push(id);
    const result = await pool.query(
      `UPDATE vat_masters SET ${fields.join(", ")} WHERE id=$${i} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  // ─── Delete ────────────────────────────────────────────
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM vat_masters WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = VatMaster;