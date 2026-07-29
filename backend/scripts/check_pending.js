const { User } = require('../models');
async function run() {
  try {
    const users = await User.findAll({ raw: true });
    console.log('--- DATABASE DIAGNOSTIC INFO ---');
    console.log(JSON.stringify(users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      hostelBlock: u.hostelBlock,
      gender: u.gender
    })), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
