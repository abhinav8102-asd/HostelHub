const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Production / PostgreSQL configuration
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Supabase/Neon SSL connections
      }
    },
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
} else {
  // Development / SQLite configuration
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
}

module.exports = sequelize;
