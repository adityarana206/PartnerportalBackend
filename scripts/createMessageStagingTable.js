const { pool, connectDB } = require("../config/db");

const createMessageStagingTable = async () => {
  await connectDB();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS message_staging (
      id                  SERIAL PRIMARY KEY,
      thread_id           VARCHAR(50)   NOT NULL,
      document_type       VARCHAR(50)   NOT NULL DEFAULT ' ',
      category            VARCHAR(50)   NOT NULL DEFAULT ' ',
      linked_doc_type     VARCHAR(100),
      linked_doc_no       VARCHAR(50),
      sender_type         VARCHAR(20)   NOT NULL DEFAULT ' ',
      sender_id           VARCHAR(50)   NOT NULL,
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

    CREATE INDEX IF NOT EXISTS idx_message_staging_thread_id  ON message_staging(thread_id);
    CREATE INDEX IF NOT EXISTS idx_message_staging_sender_id  ON message_staging(sender_id);
    CREATE INDEX IF NOT EXISTS idx_message_staging_status     ON message_staging(status);

    -- Add bc columns to existing tables created before this migration
    ALTER TABLE message_staging ADD COLUMN IF NOT EXISTS bc_synced BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE message_staging ADD COLUMN IF NOT EXISTS bc_error  TEXT;
  `);
  console.log("✅ message_staging table created (or already exists)");
  process.exit(0);
};

createMessageStagingTable().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
