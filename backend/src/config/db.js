const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const dbType = process.env.DB_TYPE || 'sqlite';
let pool = null;
let sqliteDb = null;

const dbPath = path.join(__dirname, '../../canteenx.db');

if (process.env.DATABASE_URL) {
  const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
  console.log('[Database] Configured PostgreSQL Connection Pool via DATABASE_URL.');
} else if (dbType === 'postgres' && process.env.PGHOST) {
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER || 'canteenx',
    password: process.env.PGPASSWORD || 'canteenx_secure_pass',
    database: process.env.PGDATABASE || 'canteenx_db',
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  console.log('[Database] Configured PostgreSQL Connection Pool via PGHOST.');
} else {
  sqliteDb = new sqlite3.Database(dbPath);
  console.log(`[Database] Initialized SQLite Database at ${dbPath}`);
}

/**
 * Execute SQL Query with unified parameter replacement.
 * Supports standard $1, $2 or ? parameters.
 */
async function query(sql, params = []) {
  if (pool) {
    const res = await pool.query(sql, params);
    return res.rows;
  } else {
    return new Promise((resolve, reject) => {
      // Convert PostgreSQL $1, $2 syntax to SQLite ? syntax if needed
      let formattedSql = sql.replace(/\$\d+/g, '?');
      
      const trimmed = formattedSql.trim().toUpperCase();
      if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH') || trimmed.startsWith('PRAGMA')) {
        sqliteDb.all(formattedSql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      } else {
        sqliteDb.run(formattedSql, params, function (err) {
          if (err) return reject(err);
          resolve({ lastID: this.lastID, changes: this.changes, rows: [] });
        });
      }
    });
  }
}

/**
 * Helper to run a batch SQL script (e.g. schema.sql, seed.sql)
 */
async function runScript(scriptPath) {
  const content = fs.readFileSync(scriptPath, 'utf8');
  if (pool) {
    await pool.query(content);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.exec(content, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

module.exports = {
  query,
  runScript,
  isPostgres: () => !!pool,
};
