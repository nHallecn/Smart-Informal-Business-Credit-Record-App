const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: Number(process.env.DB_POOL_SIZE || 10),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
