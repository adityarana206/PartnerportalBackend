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

// GET /api/data-management/tables — list all allowed tables
const listTables = (req, res) => {
  res.json({ success: true, tables: ALLOWED_TABLES });
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
    const counts = await getRowCounts(client, ALLOWED_TABLES);
    // TRUNCATE with CASCADE handles FK order automatically
    await client.query(`TRUNCATE ${ALLOWED_TABLES.join(", ")} CASCADE`);
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
    const counts = await getRowCounts(client, ordered);
    // TRUNCATE with CASCADE handles FK order automatically
    await client.query(`TRUNCATE ${ordered.join(", ")} CASCADE`);
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

module.exports = { listTables, deleteAllData, deleteSelectedTables };
