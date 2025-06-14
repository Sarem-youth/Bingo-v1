const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.User = require('./user.model.js')(sequelize, Sequelize.DataTypes);
db.Company = require('./company.model.js')(sequelize, Sequelize.DataTypes);
db.CashierAssignment = require('./cashierAssignment.model.js')(sequelize, Sequelize.DataTypes);
db.Transaction = require('./transaction.model.js')(sequelize, Sequelize.DataTypes);
db.GameSession = require('./gameSession.model.js')(sequelize, Sequelize.DataTypes);
db.BingoCard = require('./bingoCard.model.js')(sequelize, Sequelize.DataTypes);

// Define associations

// User associations
// An Admin (User) can create multiple Agents/Cashiers (Users)
db.User.hasMany(db.User, { as: 'CreatedUsers', foreignKey: 'created_by', onDelete: 'SET NULL' });
db.User.belongsTo(db.User, { as: 'Creator', foreignKey: 'created_by' });

// An Agent (User) can be a parent to multiple Cashiers (Users)
db.User.hasMany(db.User, { as: 'ManagedCashiers', foreignKey: 'parent_agent_id', onDelete: 'SET NULL' });
db.User.belongsTo(db.User, { as: 'ParentAgent', foreignKey: 'parent_agent_id' });

// Company associations
// An Agent (User) registers multiple Companies
db.User.hasMany(db.Company, { foreignKey: 'registered_by_agent_id', onDelete: 'RESTRICT' });
db.Company.belongsTo(db.User, { as: 'RegisteringAgent', foreignKey: 'registered_by_agent_id' });

// CashierAssignment associations
// A User (Cashier) can have multiple assignments (though typically one active)
db.User.hasMany(db.CashierAssignment, { foreignKey: 'cashier_user_id', onDelete: 'CASCADE' });
db.CashierAssignment.belongsTo(db.User, { as: 'Cashier', foreignKey: 'cashier_user_id' });

// A Company can have multiple CashierAssignments
db.Company.hasMany(db.CashierAssignment, { foreignKey: 'company_id', onDelete: 'CASCADE' });
db.CashierAssignment.belongsTo(db.Company, { as: 'AssignedCompany', foreignKey: 'company_id' });

// Transaction associations
// A User (Cashier) processes multiple Transactions
db.User.hasMany(db.Transaction, { foreignKey: 'user_id', as: 'ProcessedTransactions' });
db.Transaction.belongsTo(db.User, { as: 'ProcessingUser', foreignKey: 'user_id' }); // Added inverse for clarity

// Transaction associations (continued)
// A Transaction can belong to a GameSession
db.Transaction.belongsTo(db.GameSession, { foreignKey: 'game_session_id', onDelete: 'SET NULL' });
db.GameSession.hasMany(db.Transaction, { foreignKey: 'game_session_id' });

// A Transaction can belong to a Company
db.Transaction.belongsTo(db.Company, { foreignKey: 'company_id', onDelete: 'SET NULL' });
db.Company.hasMany(db.Transaction, { foreignKey: 'company_id' });

// A Transaction can be associated with an Agent
db.Transaction.belongsTo(db.User, { as: 'AssociatedAgent', foreignKey: 'agent_id', onDelete: 'SET NULL' });
db.User.hasMany(db.Transaction, { as: 'AgentTransactions', foreignKey: 'agent_id' });

// GameSession associations
// A GameSession belongs to a Company
db.GameSession.belongsTo(db.Company, { foreignKey: 'company_id', onDelete: 'CASCADE' });
db.Company.hasMany(db.GameSession, { foreignKey: 'company_id' });

// A GameSession is operated by a Cashier (User)
db.GameSession.belongsTo(db.User, { as: 'CashierOperatingSession', foreignKey: 'cashier_user_id', onDelete: 'RESTRICT' });
db.User.hasMany(db.GameSession, { as: 'OperatedGameSessions', foreignKey: 'cashier_user_id' });

// BingoCard associations
// A BingoCard belongs to a GameSession
db.BingoCard.belongsTo(db.GameSession, { foreignKey: 'game_session_id', onDelete: 'CASCADE' });
db.GameSession.hasMany(db.BingoCard, { foreignKey: 'game_session_id' });

// A BingoCard can be linked to a buy-in Transaction
db.BingoCard.belongsTo(db.Transaction, { foreignKey: 'transaction_id', onDelete: 'SET NULL' });
db.Transaction.hasMany(db.BingoCard, { foreignKey: 'transaction_id' }); // A transaction could be for multiple cards


// Test the connection (moved from db.config.js to here for centralized DB logic)
async function testConnectionAndSync() {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
    // Sync all models
    // Use { force: true } carefully in development to drop and recreate tables
    // await sequelize.sync({ force: true }); // DEV only
    await sequelize.sync({ alter: true }); // In dev, alter can be useful. In prod, use migrations.
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error('Unable to connect to the database or sync models:', error);
  }
}

testConnectionAndSync();

module.exports = db;
