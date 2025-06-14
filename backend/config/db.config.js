const { Sequelize } = require('sequelize');

// Replace with your actual database credentials
// It's recommended to use environment variables for sensitive data
const sequelize = new Sequelize(
  process.env.DB_NAME || 'bingo_db',
  process.env.DB_USER || 'your_db_user',
  process.env.DB_PASSWORD || 'your_db_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log, // Set to false in production or for less verbose logging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = db;
