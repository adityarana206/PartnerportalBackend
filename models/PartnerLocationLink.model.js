const { pool } = require("../config/db");

const PartnerLocationLink = {
  // ─── Create ────────────────────────────────────────────
  async create(data) {
    const query = `
      INSERT INTO partner_location_links (
        system_id, location_code, name, address, address2,
        city, post_code, country_region_code, phone_no, fax_no,
        contact, e_mail, home_page, county, use_as_in_transit
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
      ) RETURNING *;
    `;
    const values = [
      data.systemId          || null,
      data.locationCode      || data.location_code || null,
      data.name              || null,
      data.address           || null,
      data.address2          || null,
      data.city              || null,
      data.postCode          || data.post_code || null,
      data.countryRegionCode || data.country_region_code || null,
      data.phoneNo           || data.phone_no || null,
      data.faxNo             || data.fax_no || null,
      data.contact           || null,
      data.eMail             || data.e_mail || null,
      data.homePage          || data.home_page || null,
      data.county            || null,
      data.useAsInTransit    || data.use_as_in_transit || false,
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

  // ─── Find by Location Code ─────────────────────────────
  async findByLocationCode(locationCode) {
    const result = await pool.query(
      "SELECT * FROM partner_location_links WHERE location_code = $1",
      [locationCode],
    );
    return result.rows[0] || null;
  },

  // ─── Update ────────────────────────────────────────────
  async update(id, data) {
    const query = `
      UPDATE partner_location_links SET
        system_id=$1, location_code=$2, name=$3,
        address=$4, address2=$5, city=$6, post_code=$7,
        country_region_code=$8, phone_no=$9, fax_no=$10,
        contact=$11, e_mail=$12, home_page=$13, county=$14,
        use_as_in_transit=$15, updated_at=NOW()
      WHERE id=$16 RETURNING *;
    `;
    const values = [
      data.systemId          || null,
      data.locationCode      || data.location_code || null,
      data.name              || null,
      data.address           || null,
      data.address2          || null,
      data.city              || null,
      data.postCode          || data.post_code || null,
      data.countryRegionCode || data.country_region_code || null,
      data.phoneNo           || data.phone_no || null,
      data.faxNo             || data.fax_no || null,
      data.contact           || null,
      data.eMail             || data.e_mail || null,
      data.homePage          || data.home_page || null,
      data.county            || null,
      data.useAsInTransit    || data.use_as_in_transit || false,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // ─── Insert from BC (skip if location_code already exists) ─
  async upsertFromBC(loc) {
    const existing = await pool.query(
      `SELECT id FROM partner_location_links WHERE location_code = $1`,
      [loc.code]
    );
    if (existing.rows.length > 0) {
      return { row: existing.rows[0], action: 'skipped' };
    }
    const result = await pool.query(
      `INSERT INTO partner_location_links
         (system_id, location_code, name, address, address2,
          city, post_code, country_region_code, phone_no, fax_no,
          contact, e_mail, home_page, county, use_as_in_transit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        loc.systemId         || null,
        loc.code,
        loc.name             || null,
        loc.address          || null,
        loc.address2         || null,
        loc.city             || null,
        loc.postCode         || null,
        loc.countryRegionCode || null,
        loc.phoneNo          || null,
        loc.faxNo            || null,
        loc.contact          || null,
        loc.eMail            || null,
        loc.homePage         || null,
        loc.county           || null,
        loc.useAsInTransit   || false,
      ]
    );
    return { row: result.rows[0], action: 'inserted' };
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
