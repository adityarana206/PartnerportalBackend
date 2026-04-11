const { pool } = require("../config/db");

const PartnerLocationLink = {
  // ─── Create ────────────────────────────────────────────
  async create(data, userId) {
    const query = `
      INSERT INTO partner_location_links (
        partner_type, partner_no, description, address_code,
        address_name, location_code, address, address2,
        city, post_code, country_region_code, contact,
        phone_no, is_default, blocked, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      ) RETURNING *;
    `;
    const values = [
      data.partnerType || null, // $1
      data.partnerNo || null, // $2
      data.description || null, // $3
      data.addressCode || null, // $4
      data.addressName || null, // $5
      data.locationCode || null, // $6
      data.address || null, // $7
      data.address2 || null, // $8
      data.city || null, // $9
      data.postCode || null, // $10
      data.countryRegionCode || null, // $11
      data.contact || null, // $12
      data.phoneNo || null, // $13
      data.isDefault || false, // $14
      data.blocked || false, // $15
      userId || null, // $16
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // ─── Find All ──────────────────────────────────────────
  async findAll() {
    const result = await pool.query(
      "SELECT * FROM partner_location_links ORDER BY created_at DESC",
    );
    return result.rows;
  },

  // ─── Find by ID ────────────────────────────────────────
  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM partner_location_links WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  },

  // ─── Find by Partner No ────────────────────────────────
  async findByPartnerNo(partnerNo) {
    try {
      const result = await pool.query(
        "SELECT * FROM partner_location_links WHERE partner_no = $1 ORDER BY created_at DESC",
        [partnerNo],
      );
      return result.rows;
    } catch (error) {
      console.error('Database error in findByPartnerNo:', error);
      throw error;
    }
  },

  // ─── Find by Partner Type ──────────────────────────────
  async findByPartnerType(partnerType) {
    const result = await pool.query(
      "SELECT * FROM partner_location_links WHERE partner_type = $1 ORDER BY created_at DESC",
      [partnerType],
    );
    return result.rows;
  },

  // ─── Find by Location Code ─────────────────────────────
  async findByLocationCode(locationCode) {
    const result = await pool.query(
      "SELECT * FROM partner_location_links WHERE location_code = $1 ORDER BY created_at DESC",
      [locationCode],
    );
    return result.rows;
  },

  // ─── Find Default by Partner No ────────────────────────
  async findDefaultByPartnerNo(partnerNo) {
    const result = await pool.query(
      "SELECT * FROM partner_location_links WHERE partner_no = $1 AND is_default = true",
      [partnerNo],
    );
    return result.rows[0] || null;
  },

  // ─── Update ────────────────────────────────────────────
  async update(id, data) {
    const query = `
      UPDATE partner_location_links SET
        partner_type=$1, partner_no=$2, description=$3,
        address_code=$4, address_name=$5, location_code=$6,
        address=$7, address2=$8, city=$9, post_code=$10,
        country_region_code=$11, contact=$12, phone_no=$13,
        is_default=$14, blocked=$15, updated_at=NOW()
      WHERE id=$16 RETURNING *;
    `;
    const values = [
      data.partnerType || null, // $1
      data.partnerNo || null, // $2
      data.description || null, // $3
      data.addressCode || null, // $4
      data.addressName || null, // $5
      data.locationCode || null, // $6
      data.address || null, // $7
      data.address2 || null, // $8
      data.city || null, // $9
      data.postCode || null, // $10
      data.countryRegionCode || null, // $11
      data.contact || null, // $12
      data.phoneNo || null, // $13
      data.isDefault || false, // $14
      data.blocked || false, // $15
      id, // $16
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // ─── Update Block Status ───────────────────────────────
  async updateBlocked(id, blocked) {
    const result = await pool.query(
      `UPDATE partner_location_links SET blocked=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [blocked, id],
    );
    return result.rows[0] || null;
  },

  // ─── Update Default Status ─────────────────────────────
  async updateDefault(id, partnerNo, isDefault) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // ─── Remove default from all partner locations ───────
      if (isDefault) {
        await client.query(
          `UPDATE partner_location_links SET is_default=false
           WHERE partner_no=$1 AND id != $2`,
          [partnerNo, id],
        );
      }

      // ─── Set default on this location ────────────────────
      const result = await client.query(
        `UPDATE partner_location_links SET is_default=$1, updated_at=NOW()
         WHERE id=$2 RETURNING *`,
        [isDefault, id],
      );

      await client.query("COMMIT");
      return result.rows[0] || null;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // ─── Delete ────────────────────────────────────────────
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM partner_location_links WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = PartnerLocationLink;
