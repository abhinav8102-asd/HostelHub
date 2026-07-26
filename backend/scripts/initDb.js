const mysql = require('mysql2/promise');
require('dotenv').config();

const initDB = async () => {
  const dbName = process.env.DB_NAME || 'hostelhub';
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  };

  try {
    console.log(`Connecting to MySQL server at ${connectionConfig.host}...`);
    const connection = await mysql.createConnection(connectionConfig);
    
    console.log(`Creating database "${dbName}" if it does not exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    
    console.log(`Database "${dbName}" initialized successfully.`);
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDB();
