const { pool } = require("../config/db");

const UnitOfMeasure = {
  async findAll() {
    const result = await pool.query("SELECT * FROM unit_of_measures ORDER BY code");
    return result.rows;
  },

  async findByCode(code) {
    const result = await pool.query("SELECT * FROM unit_of_measures WHERE code = $1", [code]);
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM unit_of_measures WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async create(data) {
    const result = await pool.query(
      "INSERT INTO unit_of_measures (code, description) VALUES ($1,$2) RETURNING *",
      [data.code, data.description || null]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
      "UPDATE unit_of_measures SET code=$1, description=$2, updated_at=NOW() WHERE id=$3 RETURNING *",
      [data.code, data.description || null, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM unit_of_measures WHERE id=$1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = UnitOfMeasure;
