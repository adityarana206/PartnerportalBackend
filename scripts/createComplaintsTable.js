const { pool, connectDB } = require("../config/db");

const createComplaintsTable = async () => {
  await connectDB();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS complaints (
      id                  SERIAL PRIMARY KEY,
      thread_id           VARCHAR(50),
      document_type       VARCHAR(50)   NOT NULL DEFAULT ' ',
      category            VARCHAR(50)   NOT NULL DEFAULT ' ',
      linked_doc_type     VARCHAR(100),
      linked_doc_no       VARCHAR(50),
      sender_type         VARCHAR(20)   NOT NULL DEFAULT ' ',
      partner_type        VARCHAR(20)   NOT NULL DEFAULT ' ',
      sender_id           VARCHAR(50),
      sender_name         VARCHAR(255),
      message_text        TEXT,
      change_details      TEXT,
      message_timestamp   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      direction           VARCHAR(20)   NOT NULL DEFAULT ' ',
      status              VARCHAR(20)   NOT NULL DEFAULT ' ',
      bc_synced           BOOLEAN       NOT NULL DEFAULT false,
      bc_error            TEXT,
      created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_complaints_thread_id ON complaints(thread_id);
    CREATE INDEX IF NOT EXISTS idx_complaints_sender_id ON complaints(sender_id);
    CREATE INDEX IF NOT EXISTS idx_complaints_status    ON complaints(status);
  `);
  console.log("✅ complaints table created (or already exists)");
  process.exit(0);
};

createComplaintsTable().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
