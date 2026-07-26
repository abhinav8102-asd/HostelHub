/**
 * Migration: Add 'priority' column to complaints table
 * Run with: node scripts/migrate_add_priority.js
 */
const sequelize = require('../config/db');

async function migrate() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Check if column already exists
    const tableDesc = await queryInterface.describeTable('complaints');
    if (tableDesc.priority) {
      console.log('✅ priority column already exists. Skipping.');
      process.exit(0);
    }

    // SQLite doesn't support ENUM, it uses TEXT with CHECK constraint
    await sequelize.query(
      `ALTER TABLE complaints ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent'))`
    );

    console.log('✅ Migration successful: priority column added to complaints table.');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
