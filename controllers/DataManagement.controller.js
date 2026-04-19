const { pool } = require("../config/db");

// Whitelist of deletable tables in dependency order (children before parents)
const ALLOWED_TABLES = [
  // ─── Order children ───────────────────────────────────
  "sales_order_lines",
  "purchase_order_lines",
  "invoice_lines",
  "purchase_invoice_lines",
  "purchase_receipt_lines",
  "sales_shipment_lines",

  // ─── Order / document headers ─────────────────────────
  "sales_orders",
  "purchase_orders",
  "invoices",
  "purchase_invoices",
  "purchase_receipts",
  "sales_shipments",
  "payments",

  // ─── BC user registration children ───────────────────
  "bc_user_registration_contacts",
  "bc_user_registration_banks",
  "bc_user_registrations",

  // ─── Permission children ──────────────────────────────
  "user_group_assignments",
  "group_permissions",
  "user_permissions",
  "permissions",
  "blacklisted_tokens",
  "refresh_tokens",

  // ─── Permission parents ───────────────────────────────
  "permission_groups",
  "screens",

  // ─── Master / reference data ──────────────────────────
  "item_change_requests",
  "item_requests",
  "items",
  "contacts",
  "purchase_prices",
  "partner_location_links",
  "partner_announcements",
  "registration_invites",
  "item_categories",
  "unit_of_measures",
  "vat_masters",
  "no_series",

  // ─── Users (last — many tables reference users) ───────
  "users",
];

// In-memory metadata cache
let tableMetadataCache = null;

// GET /api/data-management/tables — list all allowed tables
const listTables = (req, res) => {
  res.json({ success: true, tables: ALLOWED_TABLES });
};

// POST /api/data-management/sync — refresh metadata cache and return live table list
const syncTables = async (req, res) => {
  const client = await pool.connect();
  try {
    // Clear cache
    tableMetadataCache = null;

    // Refresh: fetch existing tables with row counts from DB
    const placeholders = ALLOWED_TABLES.map((_, i) => `$${i + 1}`).join(", ");
    const r = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (${placeholders})`,
      ALLOWED_TABLES
    );
    const existingSet = new Set(r.rows.map((row) => row.tablename));
    const existing = ALLOWED_TABLES.filter((t) => existingSet.has(t));

    const counts = {};
    for (const table of existing) {
      const cr = await client.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
      counts[table] = cr.rows[0].n;
    }

    // Populate cache
    tableMetadataCache = { tables: existing, counts, refreshedAt: new Date().toISOString() };

    res.json({
      success: true,
      message: "Sync complete",
      tables: existing,
      rowCounts: counts,
      refreshedAt: tableMetadataCache.refreshedAt,
    });
  } catch (error) {
    console.error("syncTables error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// Helper: filter to only tables that exist in the DB
const getExistingTables = async (client, tables) => {
  const placeholders = tables.map((_, i) => `$${i + 1}`).join(", ");
  const r = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (${placeholders})`,
    tables
  );
  const existing = new Set(r.rows.map((row) => row.tablename));
  return tables.filter((t) => existing.has(t));
};

// Helper: get row count before deletion
const getRowCounts = async (client, tables) => {
  const counts = {};
  for (const table of tables) {
    const r = await client.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
    counts[table] = r.rows[0].n;
  }
  return counts;
};

// DELETE /api/data-management/all — delete all allowed tables
const deleteAllData = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await getExistingTables(client, ALLOWED_TABLES);
    const counts = await getRowCounts(client, existing);
    await client.query(`TRUNCATE ${existing.join(", ")} CASCADE`);
    await client.query("COMMIT");
    res.json({ success: true, message: "All table data deleted", deleted: counts });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("deleteAllData error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// DELETE /api/data-management/tables — delete from selected tables
// Body: { tables: ["sales_orders", "contacts"] }
const deleteSelectedTables = async (req, res) => {
  const { tables } = req.body;

  if (!Array.isArray(tables) || tables.length === 0) {
    return res.status(400).json({ success: false, message: "Provide a non-empty 'tables' array" });
  }

  const invalid = tables.filter((t) => !ALLOWED_TABLES.includes(t));
  if (invalid.length > 0) {
    return res.status(400).json({ success: false, message: `Invalid tables: ${invalid.join(", ")}` });
  }

  const ordered = ALLOWED_TABLES.filter((t) => tables.includes(t));

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await getExistingTables(client, ordered);
    const counts = await getRowCounts(client, existing);
    await client.query(`TRUNCATE ${existing.join(", ")} CASCADE`);
    await client.query("COMMIT");
    res.json({ success: true, message: "Selected table data deleted", deleted: counts });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("deleteSelectedTables error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

module.exports = { listTables, syncTables, deleteAllData, deleteSelectedTables };
