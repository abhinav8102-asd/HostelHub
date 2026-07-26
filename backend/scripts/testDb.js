const mysql = require('mysql2/promise');

const passwords = [
  'Admin@123',
  '',
  'root',
  'admin',
  'admin123',
  'mysql',
  '123456',
  '1234',
  'password',
  '12345678',
  'root123'
];

const test = async () => {
  for (const pw of passwords) {
    try {
      console.log(`Trying password: "${pw}"...`);
      const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: pw
      });
      console.log(`>>> SUCCESS! Password is "${pw}"`);
      await connection.end();
      process.exit(0);
    } catch (err) {
      console.log(`Failed: ${err.message}`);
    }
  }
  console.log('All passwords failed.');
  process.exit(1);
};

test();
