const { sequelize, Setting } = require('../models');

const syncDB = async () => {
  try {
    console.log('Syncing database tables safely (preserving data)...');
    try {
      await sequelize.query('DROP TABLE IF EXISTS `users_backup`;');
    } catch (e) {}
    await sequelize.sync({ alter: true }); 
    console.log('Database synced successfully.');

    // Seed default footer settings
    const defaultSettings = [
      { key: 'footer_text', value: 'Hostel Maintenance & Support Portal' },
      { key: 'footer_email', value: 'support@hostelhub.com' },
      { key: 'footer_phone', value: '+91 98765 43210' },
      { key: 'footer_copyright', value: '© 2026 HostelHub. All rights reserved.' }
    ];

    console.log('Seeding default footer settings...');
    for (const item of defaultSettings) {
      const [setting, created] = await Setting.findOrCreate({
        where: { key: item.key },
        defaults: { value: item.value }
      });
      if (created) {
        console.log(`Created setting: ${item.key}`);
      }
    }
    console.log('Default settings check complete.');

    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
};

syncDB();
