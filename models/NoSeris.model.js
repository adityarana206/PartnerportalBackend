const { pool } = require("../config/db");

const NoSeries = {
  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(data, userId) {
    const query = `
      INSERT INTO no_series (
        code, description, starting_no, ending_no,
        last_no_used, warning_no, increment_by_no,
        allow_gaps, date_order, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
      ) RETURNING *;
    `;
    const values = [
      data.code,                         // $1  code
      data.description      || null,     // $2  description
      data.startingNo       ?? 1,        // $3  starting_no
      data.endingNo         ?? 999999,   // $4  ending_no
      data.lastNoUsed       ?? 0,        // $5  last_no_used
      data.warningNo        || null,     // $6  warning_no
      data.incrementByNo    ?? 1,        // $7  increment_by_no
      data.allowGaps        ?? false,    // $8  allow_gaps
      data.dateOrder        ?? false,    // $9  date_order
      userId                || null,     // $10 created_by
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // ─── READ ALL ─────────────────────────────────────────────────────────────
  async findAll() {
    const result = await pool.query(
      "SELECT * FROM no_series ORDER BY created_at DESC"
    );
    return result.rows;
  },

  // ─── READ ONE ─────────────────────────────────────────────────────────────
  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM no_series WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },

  async findByCode(code) {
    const result = await pool.query(
      "SELECT * FROM no_series WHERE code = $1",
      [code]
    );
    return result.rows[0] || null;
  },

  // ─── UPDATE (FULL) ────────────────────────────────────────────────────────
  async update(id, data) {
    const query = `
      UPDATE no_series SET
        code=$1, description=$2, starting_no=$3, ending_no=$4,
        last_no_used=$5, warning_no=$6, increment_by_no=$7,
        allow_gaps=$8, date_order=$9, updated_at=NOW()
      WHERE id=$10 RETURNING *;
    `;
    const values = [
      data.code,                         // $1  code
      data.description      || null,     // $2  description
      data.startingNo       ?? 1,        // $3  starting_no
      data.endingNo         ?? 999999,   // $4  ending_no
      data.lastNoUsed       ?? 0,        // $5  last_no_used
      data.warningNo        || null,     // $6  warning_no
      data.incrementByNo    ?? 1,        // $7  increment_by_no
      data.allowGaps        ?? false,    // $8  allow_gaps
      data.dateOrder        ?? false,    // $9  date_order
      id,                                // $10 id
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // ─── INCREMENT last_no_used → returns updated row with new number ─────────
  async getNextNumber(id) {
    const series = await NoSeries.findById(id);
    if (!series) return null;

    if (series.last_no_used >= series.ending_no) {
      throw new Error("Number series has reached its ending number");
    }

    const result = await pool.query(
      `UPDATE no_series
         SET last_no_used = last_no_used + increment_by_no,
             updated_at   = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  // ─── RESET last_no_used TO starting_no - increment_by_no ─────────────────
  async reset(id) {
    const result = await pool.query(
      `UPDATE no_series
         SET last_no_used = starting_no - increment_by_no,
             updated_at   = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM no_series WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = NoSeries;