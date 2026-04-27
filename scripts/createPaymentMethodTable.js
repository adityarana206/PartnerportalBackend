const { pool } = require("../config/db");

const createPaymentMethodTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL UNIQUE,
      code        VARCHAR(50)  NOT NULL UNIQUE,
      description TEXT,
      is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
  console.log("✅ payment_methods table created");
  await pool.end();
};

createPaymentMethodTable().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
