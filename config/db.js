const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
  max: parseInt(process.env.DB_MAX_CONNECTIONS || "10", 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "30000", 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || "5000", 10),
});

pool.on("error", (err) => {
  console.error("Unexpected pg pool error:", err.message);
});

const connectDB = async () => {
  try {
    console.log("Attempting to connect to PostgreSQL...");

    const client = await pool.connect();
    const res = await client.query("SELECT current_database(), version()");
    const { current_database, version } = res.rows[0];

    console.log("✅ PostgreSQL connected!");
    console.log("   DB:", current_database);
    console.log("   Version:", version.split(" ").slice(0, 2).join(" "));

    client.release();
    return pool;
  } catch (error) {
    console.error("PostgreSQL connection error:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, pool };
