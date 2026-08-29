const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');
require('dotenv').config();

const seedDB = async () => {
  try {
    console.log('Seeding database...');
    
    // Ensure connection
    await sequelize.authenticate();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hostelhub.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Create password hash for Admin
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

    // Seed test accounts for Warden, Staff, and Student
    const testHash = await bcrypt.hash('password', 10);

    const defaultWarden = {
      name: 'Warden Test',
      email: 'warden@gmail.com',
      password: testHash,
      role: 'warden',
      phone: '8888888888',
      hostelBlock: 'All',
      gender: 'male',
      status: 'active'
    };

    const defaultStaff = {
      name: 'Staff Test',
      email: 'staff@gmail.com',
      password: testHash,
      role: 'staff',
      phone: '7777777777',
      status: 'active'
    };

    const defaultStudent = {
      name: 'Student Test',
      email: 'student@gmail.com',
      password: testHash,
      role: 'student',
      phone: '6666666666',
      hostelBlock: 'Boys Hostel 1',
      roomNumber: '101',
      batch: 'Batch 2025-2029',
      gender: 'male',
      rollNumber: 'STU001',
      status: 'active'
    };

    const existingWarden = await User.findOne({ where: { email: defaultWarden.email } });
    if (!existingWarden) {
      await User.create(defaultWarden);
      console.log('✅ Default Warden account seeded.');
    }

    const existingStaff = await User.findOne({ where: { email: defaultStaff.email } });
    if (!existingStaff) {
      await User.create(defaultStaff);
      console.log('✅ Default Staff account seeded.');
    }

    const existingStudent = await User.findOne({ where: { email: defaultStudent.email } });
    if (!existingStudent) {
      await User.create(defaultStudent);
      console.log('✅ Default Student account seeded.');
    }

    console.log('Seeding process complete.');
  } catch (error) {
    console.error('⚠️ Seeding warning (non-fatal):', error.message);
  }
};

module.exports = seedDB;

if (require.main === module) {
  seedDB().then(() => process.exit(0));
}
