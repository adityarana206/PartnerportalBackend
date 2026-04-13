const { pool } = require("../config/db");

const Contact = {
  // ─── Create ───────────────────────────────────────────
  async create(data, userId) {
    const query = `
      INSERT INTO contacts (
        contact_no, contact_name, email, phone_no, mobile_phone_no,
        company_no, company_name, portal_user, portal_admin,
        partner_type, partner_no, ship_to_code, vendor_location_code,
        location_code, address, address2, city, post_code,
        country_region_code, job_title, language_code,
        department, fax_no, home_page,
        sync_status, last_synced_date_time, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
        $14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,
        $25,$26,$27
      ) RETURNING *;
    `;
    const values = [
      data.contactNo || null,
      data.contactName,
      data.email || null,
      data.phone || data.phoneNo || null,
      data.mobilePhoneNo || null,
      data.companyNo || null,
      data.companyName || null,
      data.portalUser ?? false,
      data.portalAdmin ?? false,
      data.role || data.partnerType || null,
      data.partnerNo || null,
      data.shipToCode || null,
      data.vendorLocationCode || null,
      data.locationCode || null,
      data.address || null,
      data.address2 || null,
      data.city || null,
      data.postCode || null,
      data.countryRegionCode || null,
      data.jobTitle || null,
      data.languageCode || null,
      data.department || null,
      data.faxNo || null,
      data.homePage || null,
      data.syncStatus || "Pending",
      data.lastSyncedDateTime || null,
      userId || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // ─── Find All ──────────────────────────────────────────
  async findAll() {
    const result = await pool.query(
      "SELECT * FROM contacts ORDER BY created_at DESC",
    );
    return result.rows;
  },

  // ─── Find by ID ────────────────────────────────────────
  async findById(id) {
    const result = await pool.query("SELECT * FROM contacts WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  },

  // ─── Find by Portal Contact No ────────────────────────
  async findByPortalContactNo(portalContactNo) {
    const result = await pool.query(
      "SELECT * FROM contacts WHERE portal_contact_no = $1",
      [portalContactNo],
    );
    return result.rows[0] || null;
  },

  // ─── Find by Contact No ────────────────────────────────
  async findByContactNo(contactNo) {
    const result = await pool.query(
      "SELECT * FROM contacts WHERE contact_no = $1",
      [contactNo],
    );
    return result.rows[0] || null;
  },

  // ─── Find by Partner No ────────────────────────────────
  async findByPartnerNo(partnerNo) {
    const result = await pool.query(
      "SELECT * FROM contacts WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo],
    );
    return result.rows;
  },

  // ─── Find by Company No ────────────────────────────────
  async findByCompanyNo(companyNo) {
    const result = await pool.query(
      "SELECT * FROM contacts WHERE company_no = $1 ORDER BY created_at DESC",
      [companyNo],
    );
    return result.rows;
  },

  // ─── Find by Sync Status ───────────────────────────────
  async findBySyncStatus(syncStatus) {
    const result = await pool.query(
      "SELECT * FROM contacts WHERE sync_status = $1 ORDER BY created_at DESC",
      [syncStatus],
    );
    return result.rows;
  },

  // ─── Update ────────────────────────────────────────────
  async update(id, data) {
    const query = `
      UPDATE contacts SET
        contact_no=$1, contact_name=$2, email=$3, phone_no=$4,
        mobile_phone_no=$5, company_no=$6, company_name=$7,
        portal_user=$8, portal_admin=$9, partner_type=$10,
        partner_no=$11, ship_to_code=$12, vendor_location_code=$13,
        location_code=$14, address=$15, address2=$16, city=$17,
        post_code=$18, country_region_code=$19, job_title=$20,
        language_code=$21, department=$22, fax_no=$23, home_page=$24,
        sync_status=$25, last_synced_date_time=$26,
        updated_at=NOW()
      WHERE id=$27 RETURNING *;
    `;
    const values = [
      data.contactNo || null,
      data.contactName,
      data.email || null,
      data.phone || data.phoneNo || null,
      data.mobilePhoneNo || null,
      data.companyNo || null,
      data.companyName || null,
      data.portalUser ?? false,
      data.portalAdmin ?? false,
      data.role || data.partnerType || null,
      data.partnerNo || null,
      data.shipToCode || null,
      data.vendorLocationCode || null,
      data.locationCode || null,
      data.address || null,
      data.address2 || null,
      data.city || null,
      data.postCode || null,
      data.countryRegionCode || null,
      data.jobTitle || null,
      data.languageCode || null,
      data.department || null,
      data.faxNo || null,
      data.homePage || null,
      data.syncStatus || "Pending",
      data.lastSyncedDateTime || null,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // ─── Update Sync Status ────────────────────────────────
  async updateSyncStatus(id, syncStatus) {
    const result = await pool.query(
      `UPDATE contacts SET sync_status=$1, last_synced_date_time=NOW(), updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [syncStatus, id],
    );
    return result.rows[0] || null;
  },

  // ─── Update Portal Access ──────────────────────────────
  async updatePortalAccess(id, portalUser, portalAdmin) {
    const result = await pool.query(
      `UPDATE contacts SET portal_user=$1, portal_admin=$2, updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [portalUser, portalAdmin, id],
    );
    return result.rows[0] || null;
  },

  // ─── Delete ────────────────────────────────────────────
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM contacts WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = Contact;
