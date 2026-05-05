const { Pool } = require("pg");

const pool = new Pool({
  host: "aws-1-us-east-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.lrvvggpucauzbqevwkeq",
  password: "azdUbNPIZFKUbHJG",
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
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
