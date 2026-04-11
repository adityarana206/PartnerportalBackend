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
      ) RETURNING *;
    `;
    const values = [
      data.partnerno || null, // $1  ref_no
      data.name, // $2  name
      data.name2 || null, // $3  name2
      data.address || null, // $4  address
      data.address2 || null, // $5  address2
      data.city || null, // $6  city
      data.postCode || null, // $7  post_code
      data.countryRegionCode || null, // $8  country_region_code
      data.phoneNo || null, // $9  phone_no
      data.email || null, // $10 email
      data.vatRegistrationNo || null, // $11 vat_registration_no
      data.currencyCode || null, // $12 currency_code
      data.paymentTermsCode || null, // $13 payment_terms_code
      data.password || null, // $14 password
      role, // $15 role
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findAll(role) {
    const query = role
      ? `SELECT u.id, u.ref_no, u.name, u.name2, u.address, u.address2, u.city, u.post_code,
         u.country_region_code, u.phone_no, u.email, u.vat_registration_no, u.currency_code,
         u.payment_terms_code, u.role, u.created_at, u.updated_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', pg.id,
               'group_name', pg.group_name,
               'description', pg.description,
               'assigned_at', uga.assigned_at
             )
           ) FILTER (WHERE pg.id IS NOT NULL), '[]'
         ) as permission_groups
         FROM users u
         LEFT JOIN user_group_assignments uga ON u.id = uga.user_id
         LEFT JOIN permission_groups pg ON uga.group_id = pg.id
         WHERE u.role = $1
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      : `SELECT u.id, u.ref_no, u.name, u.name2, u.address, u.address2, u.city, u.post_code,
         u.country_region_code, u.phone_no, u.email, u.vat_registration_no, u.currency_code,
         u.payment_terms_code, u.role, u.created_at, u.updated_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', pg.id,
               'group_name', pg.group_name,
               'description', pg.description,
               'assigned_at', uga.assigned_at
             )
           ) FILTER (WHERE pg.id IS NOT NULL), '[]'
         ) as permission_groups
         FROM users u
         LEFT JOIN user_group_assignments uga ON u.id = uga.user_id
         LEFT JOIN permission_groups pg ON uga.group_id = pg.id
         GROUP BY u.id
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
       COALESCE(
         json_agg(
           json_build_object(
             'id', pg.id,
             'group_name', pg.group_name,
             'description', pg.description,
             'assigned_at', uga.assigned_at
           )
         ) FILTER (WHERE pg.id IS NOT NULL), '[]'
       ) as permission_groups
       FROM users u
       LEFT JOIN user_group_assignments uga ON u.id = uga.user_id
       LEFT JOIN permission_groups pg ON uga.group_id = pg.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id],
    );
    return result.rows[0] || null;
  },

  async findAllByRoles(roles) {
    const query = `
      SELECT u.id, u.ref_no, u.name, u.name2, u.address, u.address2, u.city, u.post_code,
             u.country_region_code, u.phone_no, u.email, u.vat_registration_no, u.currency_code,
             u.payment_terms_code, u.role, u.created_at, u.updated_at,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', pg.id,
                   'group_name', pg.group_name,
                   'description', pg.description,
                   'assigned_at', uga.assigned_at
                 )
               ) FILTER (WHERE pg.id IS NOT NULL), '[]'
             ) as permission_groups
      FROM users u
      LEFT JOIN user_group_assignments uga ON u.id = uga.user_id
      LEFT JOIN permission_groups pg ON uga.group_id = pg.id
      WHERE u.role = ANY($1::text[])
      GROUP BY u.id
      ORDER BY u.created_at DESC`;
    const result = await pool.query(query, [roles]);
    return result.rows;
  },

  async findByIdAndRole(id, role) {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND role = $2",
      [id, role],
    );
    return result.rows[0] || null;
  },

  async findByRefNo(refNo) {
    const result = await pool.query("SELECT * FROM users WHERE ref_no = $1", [
      refNo,
    ]);
    return result.rows[0] || null;
  },

  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  },

  async findByEmailWithPassword(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
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
};

module.exports = User;
