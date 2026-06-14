const { Pool } = require("pg");

function parsePostgresUrl(url) {
  if (!url) {
    return null;
  }

  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    ssl: parsed.searchParams.get("ssl") === "true" ? { rejectUnauthorized: false } : false,
  };
}

const urlConfig = parsePostgresUrl(process.env.DATABASE_URL);

const pool = new Pool({
  host: urlConfig?.host || process.env.DB_HOST,
  port: urlConfig?.port || (process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432),
  user: urlConfig?.user || process.env.DB_USER,
  password: urlConfig?.password || process.env.DB_PASSWORD,
  database: urlConfig?.database || process.env.DB_NAME,
  max: Number(process.env.DB_POOL_SIZE || 10),
  ssl: urlConfig?.ssl || (process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false),
});

module.exports = pool;
module.exports.parsePostgresUrl = parsePostgresUrl;
