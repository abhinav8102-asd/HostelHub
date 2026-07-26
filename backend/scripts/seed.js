const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

const seedDB = async () => {
  try {
    console.log('Seeding default users...');
    
    // Ensure connection
    await sequelize.authenticate();

    // Create password hashes
    const studentHash = await bcrypt.hash('student123', 10);
    const wardenHash = await bcrypt.hash('warden123', 10);
    const staffHash = await bcrypt.hash('staff123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);

    const defaultUsers = [
      {
        name: 'Abhinav Admin',
        email: 'admin@hostelhub.com',
        password: adminHash,
        role: 'admin',
        phone: '9876543210',
        status: 'active'
      },
      {
        name: 'Rahul Student',
        email: 'student@hostelhub.com',
        password: studentHash,
        role: 'student',
        phone: '8765432109',
        roomNumber: '102-B',
        hostelBlock: 'Block-A',
        status: 'active'
      },
      {
        name: 'Sharma Warden',
        email: 'warden@hostelhub.com',
        password: wardenHash,
        role: 'warden',
        phone: '7654321098',
        hostelBlock: 'Block-A',
        status: 'active'
      },
      {
        name: 'Amit Electrician',
        email: 'electrician@hostelhub.com',
        password: staffHash,
        role: 'staff',
        phone: '6543210987',
        status: 'active'
      },
      {
        name: 'Vijay Plumber',
        email: 'plumber@hostelhub.com',
        password: staffHash,
        role: 'staff',
        phone: '5432109876',
        status: 'active'
      },
      {
        name: 'Ramesh Cleaner',
        email: 'cleaner@hostelhub.com',
        password: staffHash,
        role: 'staff',
        phone: '4321098765',
        status: 'active'
      }
    ];

    // Bulk create
    for (const u of defaultUsers) {
      const existing = await User.findOne({ where: { email: u.email } });
      if (!existing) {
        await User.create(u);
        console.log(`Created user: ${u.email}`);
      } else {
        console.log(`User already exists: ${u.email}`);
      }
    }

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
