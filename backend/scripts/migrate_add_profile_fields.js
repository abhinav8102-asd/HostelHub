/**
 * Migration: Add 'profile_pic_url' and 'bio' columns to users table
 * Run with: node scripts/migrate_add_profile_fields.js
 */
const sequelize = require('../config/db');

async function migrate() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Check table description
    const tableDesc = await queryInterface.describeTable('users');
    
    if (!tableDesc.profile_pic_url) {
      console.log('Adding profile_pic_url column...');
      await sequelize.query(
        `ALTER TABLE users ADD COLUMN profile_pic_url TEXT NULL`
      );
      console.log('✅ Added profile_pic_url column.');
    } else {
      console.log(' profile_pic_url column already exists. Skipping.');
    }

    if (!tableDesc.bio) {
      console.log('Adding bio column...');
      await sequelize.query(
        `ALTER TABLE users ADD COLUMN bio TEXT NULL`
      );
      console.log('✅ Added bio column.');
    } else {
      console.log(' bio column already exists. Skipping.');
    }

    console.log('✅ Migration successful: Profile columns checked/added to users table.');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
