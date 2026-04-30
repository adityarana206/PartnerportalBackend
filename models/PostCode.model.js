const { pool } = require("../config/db");

const PostCode = {
  async upsertFromBC(data) {
    const result = await pool.query(
      `INSERT INTO post_codes (code, city, country_code, county, system_id, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (code, country_code)
       DO UPDATE SET city = EXCLUDED.city, county = EXCLUDED.county,
                     system_id = EXCLUDED.system_id, updated_at = NOW()
       RETURNING *, (xmax = 0) AS inserted`,
      [data.code || null, data.city || null, data.countryCode || null, data.county || null, data.systemId || null]
    );
    return result.rows[0];
  },

  async findAll({ search, countryCode } = {}) {
    let query = "SELECT * FROM post_codes WHERE 1=1";
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (code ILIKE $${params.length} OR city ILIKE $${params.length})`;
    }
    if (countryCode) {
      params.push(countryCode);
      query += ` AND country_code = $${params.length}`;
    }
    query += " ORDER BY country_code, code";
    const result = await pool.query(query, params);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM post_codes WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE post_codes SET code=$1, city=$2, country_code=$3, county=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [data.code, data.city || null, data.countryCode || null, data.county || null, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query("DELETE FROM post_codes WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] || null;
  },
};

module.exports = PostCode;
