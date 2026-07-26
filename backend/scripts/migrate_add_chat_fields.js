/**
 * Migration & Seed Script: Group Chat System
 * Adds gender & batch columns to users, creates chat tables, and seeds initial batch groups.
 * Run with: node scripts/migrate_add_chat_fields.js
 */
const sequelize = require('../config/db');
const { GroupChat } = require('../models');

async function migrate() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('Checking users table columns...');
    const tableDesc = await queryInterface.describeTable('users');
    
    if (!tableDesc.gender) {
      console.log('Adding gender column...');
      await sequelize.query(`ALTER TABLE users ADD COLUMN gender TEXT DEFAULT 'male'`);
      console.log('✅ Added gender column.');
    }

    if (!tableDesc.batch) {
      console.log('Adding batch column...');
      await sequelize.query(`ALTER TABLE users ADD COLUMN batch TEXT DEFAULT 'Batch 2025'`);
      console.log('✅ Added batch column.');
    }

    console.log('Syncing GroupChat and ChatMessage tables...');
    await GroupChat.sync();
    const ChatMessage = require('../models/ChatMessage');
    await ChatMessage.sync();

    const msgDesc = await queryInterface.describeTable('chat_messages');
    if (!msgDesc.attachment_url) {
      await sequelize.query(`ALTER TABLE chat_messages ADD COLUMN attachment_url TEXT NULL`);
    }
    if (!msgDesc.is_deleted) {
      await sequelize.query(`ALTER TABLE chat_messages ADD COLUMN is_deleted BOOLEAN DEFAULT 0`);
    }
    if (!msgDesc.deleted_by) {
      await sequelize.query(`ALTER TABLE chat_messages ADD COLUMN deleted_by INTEGER NULL`);
    }
    if (!msgDesc.deleted_by_name) {
      await sequelize.query(`ALTER TABLE chat_messages ADD COLUMN deleted_by_name TEXT NULL`);
    }

    const annDesc = await queryInterface.describeTable('announcements');
    if (!annDesc.photo_url) {
      await sequelize.query(`ALTER TABLE announcements ADD COLUMN photo_url TEXT NULL`);
    }
    console.log('✅ Chat & Announcement tables created/synced.');

    // Seed default batch groups
    const defaultGroups = [
      { name: 'Boys - Batch 2025', gender: 'male', batch: 'Batch 2025', hostelBlock: 'All', description: 'Official Group Chat for Batch 2025 Boys' },
      { name: 'Girls - Batch 2025', gender: 'female', batch: 'Batch 2025', hostelBlock: 'All', description: 'Official Group Chat for Batch 2025 Girls' },
      { name: 'Boys - Batch 2024', gender: 'male', batch: 'Batch 2024', hostelBlock: 'All', description: 'Official Group Chat for Batch 2024 Boys' },
      { name: 'Girls - Batch 2024', gender: 'female', batch: 'Batch 2024', hostelBlock: 'All', description: 'Official Group Chat for Batch 2024 Girls' },
      { name: 'Boys - Batch 2026', gender: 'male', batch: 'Batch 2026', hostelBlock: 'All', description: 'Official Group Chat for Batch 2026 Boys' },
      { name: 'Girls - Batch 2026', gender: 'female', batch: 'Batch 2026', hostelBlock: 'All', description: 'Official Group Chat for Batch 2026 Girls' }
    ];

    for (const group of defaultGroups) {
      const [g, created] = await GroupChat.findOrCreate({
        where: { name: group.name },
        defaults: group
      });
      if (created) {
        console.log(`✅ Seeded group room: ${group.name}`);
      }
    }

    console.log('✅ Group Chat Migration & Seeding Successful!');
  } catch (err) {
    console.error('❌ Migration Error:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
