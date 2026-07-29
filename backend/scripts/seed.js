const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');
require('dotenv').config();

const seedDB = async () => {
  try {
    console.log('Seeding database...');
    
    // Ensure connection
    await sequelize.authenticate();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('⚠️ Warning: ADMIN_EMAIL or ADMIN_PASSWORD not set in environment. Skipping admin account creation.');
      process.exit(0);
    }

    // Create password hash for the custom Admin
    const adminHash = await bcrypt.hash(adminPassword, 10);

    const adminUser = {
      name: 'Super Admin',
      email: adminEmail.trim().toLowerCase(),
      password: adminHash,
      role: 'admin',
      phone: '9999999999',
      status: 'active'
    };

    const existing = await User.findOne({ where: { email: adminUser.email } });
    if (!existing) {
      await User.create(adminUser);
      console.log(`✅ Secure Admin account created successfully for: ${adminUser.email}`);
    } else {
      console.log(`ℹ️ Admin account already exists for: ${adminUser.email}`);
    }

    // Seed default batch groups
    const { GroupChat } = require('../models');
    const defaultGroups = [
      { name: 'Boys - Batch 2023-2027', gender: 'male', batch: 'Batch 2023-2027', hostelBlock: 'All', description: 'Official Group Chat for Batch 2023-2027 Boys' },
      { name: 'Girls - Batch 2023-2027', gender: 'female', batch: 'Batch 2023-2027', hostelBlock: 'All', description: 'Official Group Chat for Batch 2023-2027 Girls' },
      { name: 'Boys - Batch 2024-2028', gender: 'male', batch: 'Batch 2024-2028', hostelBlock: 'All', description: 'Official Group Chat for Batch 2024-2028 Boys' },
      { name: 'Girls - Batch 2024-2028', gender: 'female', batch: 'Batch 2024-2028', hostelBlock: 'All', description: 'Official Group Chat for Batch 2024-2028 Girls' },
      { name: 'Boys - Batch 2025-2029', gender: 'male', batch: 'Batch 2025-2029', hostelBlock: 'All', description: 'Official Group Chat for Batch 2025-2029 Boys' },
      { name: 'Girls - Batch 2025-2029', gender: 'female', batch: 'Batch 2025-2029', hostelBlock: 'All', description: 'Official Group Chat for Batch 2025-2029 Girls' },
      { name: 'Boys - Batch 2026-2030', gender: 'male', batch: 'Batch 2026-2030', hostelBlock: 'All', description: 'Official Group Chat for Batch 2026-2030 Boys' },
      { name: 'Girls - Batch 2026-2030', gender: 'female', batch: 'Batch 2026-2030', hostelBlock: 'All', description: 'Official Group Chat for Batch 2026-2030 Girls' }
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

    console.log('Seeding process complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
