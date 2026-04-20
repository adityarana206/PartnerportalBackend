const { pool } = require("../config/db");

const PartnerLocationLink = {
  // ─── Create ────────────────────────────────────────────
  async create(data, userId) {
    const query = `
      INSERT INTO partner_location_links (
        system_id, partner_type, partner_no, description, address_code,
        address_name, location_code, name, address, address2,
        city, post_code, country_region_code, contact,
        phone_no, fax_no, e_mail, home_page, county,
        use_as_in_transit, is_default, blocked, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23
      ) RETURNING *;
    `;
    const values = [
      data.systemId          || null,
      data.partnerType       || null,
      data.partnerNo         || null,
      data.description       || null,
      data.addressCode       || null,
      data.addressName       || null,
      data.locationCode      || null,
      data.name              || null,
      data.address           || null,
      data.address2          || null,
      data.city              || null,
      data.postCode          || null,
      data.countryRegionCode || null,
      data.contact           || null,
      data.phoneNo           || null,
      data.faxNo             || null,
      data.eMail             || null,
      data.homePage          || null,
      data.county            || null,
      data.useAsInTransit    || false,
      data.isDefault         || false,
      data.blocked           || false,
      userId                 || null,
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
        system_id=$1, partner_type=$2, partner_no=$3, description=$4,
        address_code=$5, address_name=$6, location_code=$7, name=$8,
        address=$9, address2=$10, city=$11, post_code=$12,
        country_region_code=$13, contact=$14, phone_no=$15,
        fax_no=$16, e_mail=$17, home_page=$18, county=$19,
        use_as_in_transit=$20, is_default=$21, blocked=$22, updated_at=NOW()
      WHERE id=$23 RETURNING *;
    `;
    const values = [
      data.systemId          || null,
      data.partnerType       || null,
      data.partnerNo         || null,
      data.description       || null,
      data.addressCode       || null,
      data.addressName       || null,
      data.locationCode      || null,
      data.name              || null,
      data.address           || null,
      data.address2          || null,
      data.city              || null,
      data.postCode          || null,
      data.countryRegionCode || null,
      data.contact           || null,
      data.phoneNo           || null,
      data.faxNo             || null,
      data.eMail             || null,
      data.homePage          || null,
      data.county            || null,
      data.useAsInTransit    || false,
      data.isDefault         || false,
      data.blocked           || false,
      id,
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

  // ─── Upsert from BC ────────────────────────────────────
  async upsertFromBC(loc) {
    const existing = await pool.query(
      `SELECT id FROM partner_location_links WHERE location_code = $1 AND partner_no IS NULL`,
      [loc.code]
    );
    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE partner_location_links SET
           system_id=$1, name=$2, address=$3, address2=$4, city=$5,
           post_code=$6, country_region_code=$7, phone_no=$8, fax_no=$9,
           contact=$10, e_mail=$11, home_page=$12, county=$13,
           use_as_in_transit=$14, updated_at=NOW()
         WHERE location_code=$15 AND partner_no IS NULL RETURNING *`,
        [
          loc.systemId, loc.name, loc.address, loc.address2, loc.city,
          loc.postCode, loc.countryRegionCode, loc.phoneNo, loc.faxNo,
          loc.contact, loc.eMail, loc.homePage, loc.county,
          loc.useAsInTransit, loc.code,
        ]
      );
      return { row: result.rows[0], action: 'updated' };
    } else {
      const result = await pool.query(
        `INSERT INTO partner_location_links
           (system_id, location_code, name, description, address, address2,
            city, post_code, country_region_code, phone_no, fax_no,
            contact, e_mail, home_page, county, use_as_in_transit,
            is_default, blocked)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,false,false)
         RETURNING *`,
        [
          loc.systemId, loc.code, loc.name, loc.name,
          loc.address, loc.address2, loc.city, loc.postCode,
          loc.countryRegionCode, loc.phoneNo, loc.faxNo,
          loc.contact, loc.eMail, loc.homePage, loc.county,
          loc.useAsInTransit,
        ]
      );
      return { row: result.rows[0], action: 'inserted' };
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
