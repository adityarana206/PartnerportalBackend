const { pool } = require("../config/db");

const User = {
  async create(data, role) {
    const query = `
      INSERT INTO users (
        ref_no, name, name2,
        address, address2, city, post_code, country_region_code,
        phone_no, email, vat_registration_no, currency_code,
        payment_terms_code, password, role
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        name2 = EXCLUDED.name2,
        ref_no = EXCLUDED.ref_no,
        address = EXCLUDED.address,
        address2 = EXCLUDED.address2,
        city = EXCLUDED.city,
        post_code = EXCLUDED.post_code,
        country_region_code = EXCLUDED.country_region_code,
        phone_no = EXCLUDED.phone_no,
        vat_registration_no = EXCLUDED.vat_registration_no,
        currency_code = EXCLUDED.currency_code,
        payment_terms_code = EXCLUDED.payment_terms_code,
        updated_at = NOW()
      RETURNING *;
    `;
    const values = [
      data.partnerno || null,
      data.name,
      data.name2 || null,
      data.address || null,
      data.address2 || null,
      data.city || null,
      data.postCode || null,
      data.countryRegionCode || null,
      data.phoneNo || null,
      data.email || null,
      data.vatRegistrationNo || null,
      data.currencyCode || null,
      data.paymentTermsCode || null,
      data.password || null,
      role,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findAll(role) {
    const contactNameSubquery = `(SELECT c.contact_name FROM contacts c WHERE c.partner_no = u.ref_no LIMIT 1) AS contact_name`;
    const query = role
      ? `SELECT u.id, u.ref_no, u.name, u.name2, u.address, u.address2, u.city, u.post_code,
               u.country_region_code, u.phone_no, u.email, u.vat_registration_no, u.currency_code,
               u.payment_terms_code, u.role, u.created_at, u.updated_at, ${contactNameSubquery}
         FROM users u
         WHERE u.role = $1
         ORDER BY u.created_at DESC`
      : `SELECT u.id, u.ref_no, u.name, u.name2, u.address, u.address2, u.city, u.post_code,
               u.country_region_code, u.phone_no, u.email, u.vat_registration_no, u.currency_code,
               u.payment_terms_code, u.role, u.created_at, u.updated_at, ${contactNameSubquery}
         FROM users u
         ORDER BY u.created_at DESC`;
    const values = role ? [role] : [];
    const result = await pool.query(query, values);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT u.id, u.ref_no, u.name, u.name2, u.address, u.address2, u.city, u.post_code,
              u.country_region_code, u.phone_no, u.email, u.vat_registration_no, u.currency_code,
              u.payment_terms_code, u.role, u.created_at, u.updated_at,
              (SELECT c.contact_name FROM contacts c WHERE c.partner_no = u.ref_no LIMIT 1) AS contact_name
       FROM users u
       WHERE u.id = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  async findAllByRoles(roles) {
    const result = await pool.query(
      `SELECT u.id, u.ref_no, u.name, u.name2, u.address, u.address2, u.city, u.post_code,
              u.country_region_code, u.phone_no, u.email, u.vat_registration_no, u.currency_code,
              u.payment_terms_code, u.role, u.created_at, u.updated_at,
              (SELECT c.contact_name FROM contacts c WHERE c.partner_no = u.ref_no LIMIT 1) AS contact_name
       FROM users u
       WHERE u.role = ANY($1::text[])
       ORDER BY u.created_at DESC`,
      [roles],
    );
    return result.rows;
  },

  async findByIdAndRole(id, role) {
    const result = await pool.query(
      `SELECT u.id, u.ref_no, u.name, u.name2, u.address, u.address2, u.city, u.post_code,
              u.country_region_code, u.phone_no, u.email, u.vat_registration_no, u.currency_code,
              u.payment_terms_code, u.role, u.created_at, u.updated_at,
              (SELECT c.contact_name FROM contacts c WHERE c.partner_no = u.ref_no LIMIT 1) AS contact_name
       FROM users u
       WHERE u.id = $1 AND u.role = $2`,
      [id, role],
    );
    return result.rows[0] || null;
  },

  async findByRefNo(refNo) {
    const result = await pool.query(
      `SELECT u.*, (SELECT c.contact_name FROM contacts c WHERE c.partner_no = u.ref_no LIMIT 1) AS contact_name
       FROM users u WHERE u.ref_no = $1`,
      [refNo],
    );
    return result.rows[0] || null;
  },

  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [
      email,
    ]);
    return result.rows[0] || null;
  },

  async findByEmailWithPassword(email) {
    const result = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [
      email,
    ]);
    return result.rows[0] || null;
  },

  async update(id, data) {
    const query = `
      UPDATE users SET
        name=$1, name2=$2, address=$3, address2=$4, city=$5,
        post_code=$6, country_region_code=$7, phone_no=$8,
        email=$9, vat_registration_no=$10, currency_code=$11,
        payment_terms_code=$12, updated_at=NOW()
      WHERE id=$13 RETURNING *;
    `;
    const values = [
      data.name,
      data.name2 || null,
      data.address || null,
      data.address2 || null,
      data.city || null,
      data.postCode || null,
      data.countryRegionCode || null,
      data.phoneNo || null,
      data.email || null,
      data.vatRegistrationNo || null,
      data.currencyCode || null,
      data.paymentTermsCode || null,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0] || null;
  },

  async deleteAll() {
    const result = await pool.query(
      "DELETE FROM users WHERE role != 'super_admin' RETURNING *"
    );
    return result.rows;
  },
};

module.exports = User;
