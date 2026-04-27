const { pool } = require("../config/db");

const createPaymentTermsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payment_terms (
      id              SERIAL PRIMARY KEY,
      code            VARCHAR(50)    NOT NULL UNIQUE,
      description     VARCHAR(255)   NOT NULL,
      due_days        INTEGER        NOT NULL DEFAULT 0,
      discount_days   INTEGER        NOT NULL DEFAULT 0,
      discount_pct    NUMERIC(5,2)   NOT NULL DEFAULT 0.00,
      is_active       BOOLEAN        NOT NULL DEFAULT TRUE,
      created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    );
  `);
  console.log("✅ payment_terms table created");
  await pool.end();
};

createPaymentTermsTable().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
