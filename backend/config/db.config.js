const { Sequelize } = require('sequelize');
require('dotenv').config(); // Make sure to load .env variables

const sequelize = new Sequelize(
  process.env.DB_NAME || 'bingo_db',
  process.env.DB_USER || 'postgres', // Default to a common postgres user
  process.env.DB_PASSWORD || 'password', // Replace with a secure default or ensure .env is set
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL in dev, not in prod
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 5,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    },
    define: {
      timestamps: true, // Enables createdAt and updatedAt fields by default
      underscored: true, // Use snake_case for automatically generated attributes like foreign keys
      // freezeTableName: true, // Optional: if you want table names to be exactly as model names
    }
  }
);

// Test the connection (optional, but good for immediate feedback)
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// testConnection(); // Call it if you want to test connection on module load

// Export the sequelize instance and Sequelize library itself for model definitions
module.exports = {
  sequelize,
  Sequelize
};
