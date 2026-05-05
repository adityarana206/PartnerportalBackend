const { pool } = require("../config/db");

const BCUserRegister = {
  async create(data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const headerQuery = `
        INSERT INTO bc_user_registrations (
          partner_type, reg_type, scope, status, partner_no,
          central_partner_no, result_partner_no, requester_user_id,
          business_justification, name, name2, address, address2,
          city, post_code, country_region_code, phone_no, email,
          vat_registration_no, currency_code, payment_terms_code,
          payment_method_code, partner_posting_group, gen_bus_posting_group,
          vat_bus_posting_group, partner_email, trade_name,
          trade_license_number, trade_license_expiry_date, company_reg_number,
          entity_type, country_of_incorporation, place_of_registration,
          website, partner_category
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
          $31,$32,$33,$34,$35
        ) RETURNING *;
      `;

      const headerValues = [
        data.partnerType || "Customer",
        data.regType || "Create",
        data.scope || "Current_x0020_Company",
        data.status || "Draft",
        data.partnerNo || "",
        data.centralPartnerNo || "",
        data.resultPartnerNo || "",
        data.requesterUserId || "",
        data.businessJustification || "",
        data.name || data.tradeName || "",
        data.name2 || "",
        data.address || "",
        data.address2 || "",
        data.city || "",
        data.postCode || "",
        data.countryRegionCode || "",
        data.phoneNo || "",
        data.email || "",
        data.vatRegistrationNo || "",
        data.currencyCode || "",
        data.paymentTermsCode || "",
        data.paymentMethodCode || "",
        data.partnerPostingGroup || "",
        data.genBusPostingGroup || "",
        data.vatBusPostingGroup || "",
        data.partnerEmail || "",
        data.tradeName || "",
        data.tradeLicenseNumber || "",
        data.tradeLicenseExpiryDate || null,
        data.companyRegNumber || "",
        data.entityType || "",
        data.countryOfIncorporation || "",
        data.placeOfRegistration || "",
        data.website || "",
        data.partnerCategory || "",
      ];

      const headerResult = await client.query(headerQuery, headerValues);
      const registration = headerResult.rows[0];

      // Insert contact lines
      if (data.partnerRegContactLines && data.partnerRegContactLines.length > 0) {
        for (const contact of data.partnerRegContactLines) {
          const contactQuery = `
            INSERT INTO bc_user_registration_contacts (
              registration_id, line_no, full_name, designation,
              mobile_number, email_address
            ) VALUES ($1,$2,$3,$4,$5,$6);
          `;
          await client.query(contactQuery, [
            registration.id,
            contact.lineNo,
            contact.fullName || "",
            contact.designation || "",
            contact.mobileNumber || "",
            contact.emailAddress || "",
          ]);
        }
      }

      // Insert bank lines
      if (data.partnerRegBankLines && data.partnerRegBankLines.length > 0) {
        for (const bank of data.partnerRegBankLines) {
          const bankQuery = `
            INSERT INTO bc_user_registration_banks (
              registration_id, line_no, bank_code, name,
              bank_branch_no, bank_account_no, iban, swift_code,
              currency_code, is_primary
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);
          `;
          await client.query(bankQuery, [
            registration.id,
            bank.lineNo,
            bank.bankCode || "",
            bank.name || "",
            bank.bankBranchNo || "",
            bank.bankAccountNo || "",
            bank.iban || "",
            bank.swiftCode || "",
            bank.currencyCode || "",
            bank.isPrimary || false,
          ]);
        }
      }

      // Insert documents (SharePoint URLs)
      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          await client.query(
            `INSERT INTO bc_user_registration_documents (registration_id, name, url, size)
             VALUES ($1, $2, $3, $4)`,
            [registration.id, doc.name || "", doc.url || "", doc.size || 0]
          );
        }
      }

      await client.query("COMMIT");
      return await this.findById(registration.id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async findAll() {
    try {
      const result = await pool.query(
        "SELECT * FROM bc_user_registrations ORDER BY created_at DESC"
      );
      return result.rows;
    } catch (error) {
      console.error("Error in BCUserRegister.findAll:", error);
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        console.warn("bc_user_registrations table does not exist");
        return [];
      }
      throw error;
    }
  },

  async findById(id) {
    const regResult = await pool.query(
      "SELECT * FROM bc_user_registrations WHERE id = $1",
      [id]
    );
    if (regResult.rows.length === 0) return null;

    const registration = regResult.rows[0];

    const contactsResult = await pool.query(
      "SELECT * FROM bc_user_registration_contacts WHERE registration_id = $1 ORDER BY line_no",
      [id]
    );
    const banksResult = await pool.query(
      "SELECT * FROM bc_user_registration_banks WHERE registration_id = $1 ORDER BY line_no",
      [id]
    );
    const documentsResult = await pool.query(
      "SELECT * FROM bc_user_registration_documents WHERE registration_id = $1 ORDER BY uploaded_at",
      [id]
    );

    return {
      ...registration,
      partnerRegContactLines: contactsResult.rows,
      partnerRegBankLines: banksResult.rows,
      documents: documentsResult.rows,
    };
  },

  async findByRequesterUserId(requesterUserId) {
    const result = await pool.query(
      "SELECT * FROM bc_user_registrations WHERE requester_user_id = $1 ORDER BY created_at DESC",
      [requesterUserId]
    );
    return result.rows;
  },

  async findByStatus(status) {
    const result = await pool.query(
      "SELECT * FROM bc_user_registrations WHERE status = $1 ORDER BY created_at DESC",
      [status]
    );
    return result.rows;
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE bc_user_registrations SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "DELETE FROM bc_user_registration_contacts WHERE registration_id = $1",
        [id]
      );
      await client.query(
        "DELETE FROM bc_user_registration_banks WHERE registration_id = $1",
        [id]
      );
      await client.query(
        "DELETE FROM bc_user_registration_documents WHERE registration_id = $1",
        [id]
      );
      const result = await client.query(
        "DELETE FROM bc_user_registrations WHERE id = $1 RETURNING *",
        [id]
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
};

module.exports = BCUserRegister;
