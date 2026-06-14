require("dotenv").config();
const { Client } = require("pg");
const { parsePostgresUrl } = require("../src/config/db");

const urlConfig = parsePostgresUrl(process.env.DATABASE_URL);

const targetDatabase = urlConfig?.database || process.env.DB_NAME;
const adminConfig = {
  host: urlConfig?.host || process.env.DB_HOST,
  port: urlConfig?.port || (process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432),
  user: urlConfig?.user || process.env.DB_USER,
  password: urlConfig?.password || process.env.DB_PASSWORD,
  database: process.env.DB_MAINTENANCE_NAME || "postgres",
  ssl: urlConfig?.ssl || (process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false),
};

function quoteIdentifier(value) {
  return `"${value.replace(/"/g, '""')}"`;
}

async function createDatabase() {
  if (!targetDatabase) {
    throw new Error("DATABASE_URL or DB_NAME is required.");
  }

  const client = new Client(adminConfig);
  await client.connect();

  const exists = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [targetDatabase]);
  if (exists.rowCount === 0) {
    await client.query(`CREATE DATABASE ${quoteIdentifier(targetDatabase)}`);
    console.log(`Created PostgreSQL database: ${targetDatabase}`);
  } else {
    console.log(`PostgreSQL database already exists: ${targetDatabase}`);
  }

  await client.end();
}

createDatabase().catch(async (error) => {
  console.error("Database creation failed:", error);
  process.exit(1);
});
