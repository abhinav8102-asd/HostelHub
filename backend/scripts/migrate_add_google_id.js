/**
 * Migration: Add 'google_id' column to users table
 * Run with: node scripts/migrate_add_google_id.js
 */
const sequelize = require('../config/db');

async function migrate() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Check table description
    const tableDesc = await queryInterface.describeTable('users');
    
    if (!tableDesc.google_id) {
      console.log('Adding google_id column...');
      await sequelize.query(
        `ALTER TABLE users ADD COLUMN google_id TEXT NULL`
      );
      console.log('✅ Added google_id column.');
    } else {
      console.log('google_id column already exists. Skipping.');
    }

    console.log('✅ Migration successful: google_id check complete.');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
