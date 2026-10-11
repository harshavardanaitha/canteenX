const path = require('path');
const db = require('../config/db');

async function initializeDatabase(force = false) {
  try {
    console.log('[SeedRunner] Starting database schema & seed initialization...');
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../../database/seed.sql');

    await db.runScript(schemaPath);
    console.log('[SeedRunner] Schema applied successfully.');

    // Check if users exist before running seed
    const isForce = force || process.argv.includes('--force') || process.env.FORCE_SEED === 'true';
    const existingUsers = await db.query('SELECT COUNT(*) as count FROM users');
    const count = existingUsers[0]?.count || existingUsers[0]?.COUNT || 0;

    if (parseInt(count) === 0 || isForce) {
      if (isForce) {
        console.log('[SeedRunner] Force flag detected. Refreshing seed dataset...');
      }
      await db.runScript(seedPath);
      console.log('[SeedRunner] Seed data inserted successfully.');
    } else {
      console.log(`[SeedRunner] Database already contains ${count} users. Skipping seed execution.`);
    }
  } catch (error) {
    console.error('[SeedRunner] Error during database initialization:', error.message);
  }
}

if (require.main === module) {
  initializeDatabase(process.argv.includes('--force')).then(() => process.exit(0));
}

module.exports = { initializeDatabase };
