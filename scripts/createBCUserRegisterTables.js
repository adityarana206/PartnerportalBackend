const { pool } = require("../config/db");

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS bc_user_registrations (
        id                        SERIAL PRIMARY KEY,
        partner_type              VARCHAR(50)   NOT NULL DEFAULT 'Customer',
        reg_type                  VARCHAR(50)   NOT NULL DEFAULT 'Create',
        scope                     VARCHAR(100)  NOT NULL DEFAULT 'Current_x0020_Company',
        status                    VARCHAR(50)   NOT NULL DEFAULT 'Draft',
        partner_no                VARCHAR(50),
        central_partner_no        VARCHAR(50),
        result_partner_no         VARCHAR(50),
        requester_user_id         VARCHAR(100)  NOT NULL,
        business_justification    TEXT,
        name                      VARCHAR(255)  NOT NULL,
        name2                     VARCHAR(255),
        address                   VARCHAR(255),
        address2                  VARCHAR(255),
        city                      VARCHAR(100),
        post_code                 VARCHAR(20),
        country_region_code       VARCHAR(10),
        phone_no                  VARCHAR(50),
        email                     VARCHAR(255),
        vat_registration_no       VARCHAR(100),
        currency_code             VARCHAR(10),
        payment_terms_code        VARCHAR(50),
        payment_method_code       VARCHAR(50),
        partner_posting_group     VARCHAR(50),
        gen_bus_posting_group     VARCHAR(50),
        vat_bus_posting_group     VARCHAR(50),
        partner_email             VARCHAR(255),
        trade_name                VARCHAR(255),
        trade_license_number      VARCHAR(100),
        trade_license_expiry_date DATE,
        company_reg_number        VARCHAR(100),
        entity_type               VARCHAR(50),
        country_of_incorporation  VARCHAR(10),
        place_of_registration     VARCHAR(255),
        website                   VARCHAR(255),
        partner_category          VARCHAR(100),
        created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bc_user_registration_contacts (
        id               SERIAL PRIMARY KEY,
        registration_id  INTEGER       NOT NULL REFERENCES bc_user_registrations(id) ON DELETE CASCADE,
        line_no          INTEGER       NOT NULL,
        full_name        VARCHAR(255),
        designation      VARCHAR(255),
        mobile_number    VARCHAR(50),
        email_address    VARCHAR(255),
        created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bc_user_registration_banks (
        id               SERIAL PRIMARY KEY,
        registration_id  INTEGER       NOT NULL REFERENCES bc_user_registrations(id) ON DELETE CASCADE,
        line_no          INTEGER       NOT NULL,
        bank_code        VARCHAR(50),
        name             VARCHAR(255),
        bank_branch_no   VARCHAR(100),
        bank_account_no  VARCHAR(100),
        iban             VARCHAR(50),
        swift_code       VARCHAR(50),
        currency_code    VARCHAR(10),
        is_primary       BOOLEAN       NOT NULL DEFAULT FALSE,
        created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);

    await client.query("COMMIT");
    console.log("✅ bc_user_registrations tables created successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error creating tables:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables();
