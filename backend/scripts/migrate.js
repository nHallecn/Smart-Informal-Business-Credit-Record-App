require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../src/config/db");

async function migrate() {
  const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  await pool.query(schema);
  await pool.end();
  console.log("PostgreSQL schema is ready.");
}

migrate().catch(async (error) => {
  console.error("Migration failed:", error);
  await pool.end();
  process.exit(1);
});
