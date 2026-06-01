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

// GET /api/data-management/tables — return all public tables that actually exist in DB
const listTables = async (req, res) => {
  const client = await pool.connect();
  try {
    const r = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );
    const tables = r.rows.map((row) => row.tablename);
    res.json({ success: true, tables });
  } catch (error) {
    console.error("listTables error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// POST /api/data-management/sync — refresh metadata cache and return live table list with row counts
const syncTables = async (req, res) => {
  const client = await pool.connect();
  try {
    tableMetadataCache = null;

    const r = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );
    const existing = r.rows.map((row) => row.tablename);

    const counts = {};
    for (const table of existing) {
      const cr = await client.query(`SELECT COUNT(*)::int AS n FROM "${table}"`);
      counts[table] = cr.rows[0].n;
    }

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
    const r = await client.query(`SELECT COUNT(*)::int AS n FROM "${table}"`);
    counts[table] = r.rows[0].n;
  }
  return counts;
};

// DELETE /api/data-management/all — delete all public tables
const deleteAllData = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const r = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );
    const existing = r.rows.map((row) => row.tablename);
    const counts = await getRowCounts(client, existing);
    const quoted = existing.map((t) => `"${t}"`).join(", ");
    await client.query(`TRUNCATE ${quoted} CASCADE`);
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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await getExistingTables(client, tables);
    const counts = await getRowCounts(client, existing);
    const quoted = existing.map((t) => `"${t}"`).join(", ");
    await client.query(`TRUNCATE ${quoted} CASCADE`);
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

// POST /api/data-management/seed-basic — insert default no_series and countries (ON CONFLICT DO NOTHING)
const seedBasic = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── No Series ──────────────────────────────────────────────────────────
    const noSeriesData = [
      ["DO",     "Delivery Order",         1, 999999, 0, 1],
      ["PO",     "Purchase Order",         1, 999999, 0, 1],
      ["SO",     "Sales Order",            1, 999999, 0, 1],
      ["BATCH",  "Purchase Item Requests", 1, 999999, 0, 1],
      ["PORTAL", "Portal Item Requests",   1, 999999, 0, 1],
    ];

    let noSeriesInserted = 0;
    for (const [code, description, startingNo, endingNo, lastNoUsed, incrementByNo] of noSeriesData) {
      const r = await client.query(
        `INSERT INTO no_series (code, description, starting_no, ending_no, last_no_used, increment_by_no)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (code) DO NOTHING`,
        [code, description, startingNo, endingNo, lastNoUsed, incrementByNo]
      );
      noSeriesInserted += r.rowCount;
    }

    // ── Countries ──────────────────────────────────────────────────────────
    const countriesData = [
      ["AD","Andorra","EUR"],["AE","United Arab Emirates","AED"],["AL","Albania","ALL"],
      ["AM","Armenia","AMD"],["AO","Angola","AOA"],["AR","Argentina","ARS"],
      ["AT","Austria","EUR"],["AU","Australia","AUD"],["AZ","Azerbaijan","AZN"],
      ["BA","Bosnia and Herzegovina","BAM"],["BD","Bangladesh","BDT"],["BE","Belgium","EUR"],
      ["BG","Bulgaria","BGN"],["BH","Bahrain","BHD"],["BM","Bermuda","BMD"],
      ["BN","Brunei Darussalam","BND"],["BO","Bolivia","BOB"],["BR","Brazil","BRL"],
      ["BS","Bahamas","BSD"],["BW","Botswana","BWP"],["CA","Canada","CAD"],
      ["CH","Switzerland","CHF"],["CL","Chile","CLP"],["CM","Cameroon","XAF"],
      ["CN","China","CNY"],["CO","Colombia","COP"],["CR","Costa Rica","CRC"],
      ["CY","Cyprus","EUR"],["CZ","Czechia","CZK"],["DE","Germany","EUR"],
      ["DK","Denmark","DKK"],["DO","Dominican Republic","DOP"],["DZ","Algeria","DZD"],
      ["EC","Ecuador","USD"],["EE","Estonia","EUR"],["EG","Egypt","EGP"],
      ["EL","Greece","EUR"],["ES","Spain","EUR"],["ET","Ethiopia","ETB"],
      ["FI","Finland","EUR"],["FJ","Fiji Islands","FJD"],["FO","Faroe Islands","DKK"],
      ["FR","France","EUR"],["GB","Great Britain","GBP"],["GE","Georgia","GEL"],
      ["GG","Guernsey","GBP"],["GH","Ghana","GHS"],["GL","Greenland","DKK"],
      ["GT","Guatemala","GTQ"],["HK","Hong Kong","HKD"],["HN","Honduras","HNL"],
      ["HR","Croatia","EUR"],["HU","Hungary","HUF"],["ID","Indonesia","IDR"],
      ["IE","Ireland","EUR"],["IL","Israel","ILS"],["IM","Isle of Man","GBP"],
      ["IN","India","INR"],["IS","Iceland","ISK"],["IT","Italy","EUR"],
      ["JE","Jersey","GBP"],["JM","Jamaica","JMD"],["JO","Jordan","JOD"],
      ["JP","Japan","JPY"],["KE","Kenya","KES"],["KH","Cambodia","KHR"],
      ["KR","South Korea","KRW"],["KW","Kuwait","KWD"],["KY","Cayman Islands","KYD"],
      ["KZ","Kazakhstan","KZT"],["LB","Lebanon","LBP"],["LI","Liechtenstein","CHF"],
      ["LK","Sri Lanka","LKR"],["LT","Lithuania","EUR"],["LU","Luxembourg","EUR"],
      ["LV","Latvia","EUR"],["MA","Morocco","MAD"],["MC","Monaco","EUR"],
      ["ME","Montenegro","EUR"],["MG","Madagascar","MGA"],["MK","North Macedonia","MKD"],
      ["MN","Mongolia","MNT"],["MO","Macao","MOP"],["MT","Malta","EUR"],
      ["MU","Mauritius","MUR"],["MV","Maldives","MVR"],["MW","Malawi","MWK"],
      ["MX","Mexico","MXN"],["MY","Malaysia","MYR"],["MZ","Mozambique","MZN"],
      ["NA","Namibia","NAD"],["NG","Nigeria","NGN"],["NI","Nothern Ireland","GBP"],
      ["NL","Netherlands","EUR"],["NO","Norway","NOK"],["NP","Nepal","NPR"],
      ["NZ","New Zealand","NZD"],["OM","Oman","OMR"],["PA","Panama","PAB"],
      ["PE","Peru","PEN"],["PH","Philippines","PHP"],["PK","Pakistan","PKR"],
      ["PL","Poland","PLN"],["PR","Puerto Rico","USD"],["PT","Portugal","EUR"],
      ["PY","Paraguay","PYG"],["QA","Qatar","QAR"],["RO","Romania","RON"],
      ["RS","Serbia","RSD"],["RU","Russia","RUB"],["SA","Saudi Arabia","SAR"],
      ["SB","Solomon Islands","SBD"],["SE","Sweden","SEK"],["SG","Singapore","SGD"],
      ["SI","Slovenia","EUR"],["SK","Slovakia","EUR"],["SM","San Marino","EUR"],
      ["SN","Senegal","XOF"],["ST","São Tomé and Príncipe","STN"],["SV","El Salvador","USD"],
      ["SZ","Swaziland","SZL"],["TH","Thailand","THB"],["TN","Tunisia","TND"],
      ["TR","Türkiye","TRY"],["TT","Trinidad and Tobago","TTD"],["TW","Taiwan","TWD"],
      ["TZ","Tanzania","TZS"],["UA","Ukraine","UAH"],["UG","Uganda","UGX"],
      ["US","USA","USD"],["UY","Uruguay","UYU"],["VG","British Virgin Islands","USD"],
      ["VN","Vietnam","VND"],["VU","Vanuatu","VUV"],["WS","Samoa","WST"],
      ["XK","Kosovo","EUR"],["ZA","South Africa","ZAR"],["ZM","Zambia","ZMW"],
      ["ZW","Zimbabwe","ZWL"],
    ];

    let countriesInserted = 0;
    for (const [code, name, currencyCode] of countriesData) {
      const r = await client.query(
        `INSERT INTO countries (code, name, currency_code, is_active)
         VALUES ($1, $2, $3, false)
         ON CONFLICT (code) DO NOTHING`,
        [code, name, currencyCode]
      );
      countriesInserted += r.rowCount;
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Basic seed complete",
      inserted: {
        noSeries: noSeriesInserted,
        countries: countriesInserted,
      },
      skipped: {
        noSeries: noSeriesData.length - noSeriesInserted,
        countries: countriesData.length - countriesInserted,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("seedBasic error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

module.exports = { listTables, syncTables, deleteAllData, deleteSelectedTables, seedBasic };
