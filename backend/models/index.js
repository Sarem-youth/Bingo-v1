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

// User (Agent) to Company
db.User.hasMany(db.Company, { as: 'RegisteredCompanies', foreignKey: 'registered_by_agent_id' });
// onDelete: 'RESTRICT' is the default for non-nullable foreign keys if not specified,
// but Sequelize doesn't directly enforce RESTRICT in hasMany. It's enforced by DB.

// User (Cashier) to CashierAssignment
db.User.hasMany(db.CashierAssignment, { as: 'Assignments', foreignKey: 'cashier_user_id' });
// onDelete: 'CASCADE' handled by db.CashierAssignment.belongsTo(db.User)

// User (Cashier) to GameSession
db.User.hasMany(db.GameSession, { as: 'ManagedGameSessions', foreignKey: 'cashier_user_id' });
// onDelete: 'RESTRICT' handled by db.GameSession.belongsTo(db.User)

// User (Cashier who processed transaction) to Transaction
db.User.hasMany(db.Transaction, { as: 'ProcessedTransactions', foreignKey: 'user_id' });
// onDelete: 'RESTRICT' handled by db.Transaction.belongsTo(db.User, { as: 'ProcessingUser' })

db.User.hasMany(db.Transaction, { as: 'AssociatedAgentTransactions', foreignKey: 'agent_id' });
// onDelete: 'RESTRICT' handled by db.Transaction.belongsTo(db.User, { as: 'AssociatedAgent' })


// Company associations
// Company to User (Agent)
db.Company.belongsTo(db.User, { as: 'RegisteringAgent', foreignKey: 'registered_by_agent_id', onDelete: 'RESTRICT' });

// Company to CashierAssignment
db.Company.hasMany(db.CashierAssignment, { as: 'CashierAssignments', foreignKey: 'company_id' });
// onDelete: 'CASCADE' handled by db.CashierAssignment.belongsTo(db.Company)

// Company to GameSession
db.Company.hasMany(db.GameSession, { as: 'GameSessions', foreignKey: 'company_id' });
// onDelete: 'CASCADE' handled by db.GameSession.belongsTo(db.Company)

// Company to Transaction
db.Company.hasMany(db.Transaction, { as: 'Transactions', foreignKey: 'company_id' });
// onDelete: 'RESTRICT' handled by db.Transaction.belongsTo(db.Company)


// CashierAssignment associations
db.CashierAssignment.belongsTo(db.User, { as: 'Cashier', foreignKey: 'cashier_user_id', onDelete: 'CASCADE' });
db.CashierAssignment.belongsTo(db.Company, { as: 'Company', foreignKey: 'company_id', onDelete: 'CASCADE' });


// GameSession associations
db.GameSession.belongsTo(db.Company, { as: 'Company', foreignKey: 'company_id', onDelete: 'CASCADE' });
db.GameSession.belongsTo(db.User, { as: 'Cashier', foreignKey: 'cashier_user_id', onDelete: 'RESTRICT' });
db.GameSession.hasMany(db.BingoCard, { as: 'BingoCards', foreignKey: 'game_session_id' });
// onDelete: 'CASCADE' handled by db.BingoCard.belongsTo(db.GameSession)
db.GameSession.hasMany(db.Transaction, { as: 'Transactions', foreignKey: 'game_session_id' });
// onDelete: 'SET NULL' handled by db.Transaction.belongsTo(db.GameSession)


// BingoCard associations
db.BingoCard.belongsTo(db.GameSession, { as: 'GameSession', foreignKey: 'game_session_id', onDelete: 'CASCADE' });
db.BingoCard.belongsTo(db.Transaction, { as: 'PurchaseTransaction', foreignKey: 'transaction_id', onDelete: 'SET NULL', allowNull: true });


// Transaction associations
db.Transaction.belongsTo(db.GameSession, { as: 'GameSession', foreignKey: 'game_session_id', onDelete: 'SET NULL', allowNull: true });
db.Transaction.belongsTo(db.User, { as: 'ProcessingUser', foreignKey: 'user_id', onDelete: 'RESTRICT' }); // Cashier
db.Transaction.belongsTo(db.Company, { as: 'Company', foreignKey: 'company_id', onDelete: 'RESTRICT' });
db.Transaction.belongsTo(db.User, { as: 'AssociatedAgent', foreignKey: 'agent_id', onDelete: 'RESTRICT' }); // Agent
// If one transaction can be for multiple cards, and BingoCard has transaction_id FK
db.Transaction.hasMany(db.BingoCard, { as: 'PurchasedCards', foreignKey: 'transaction_id', allowNull: true });


// Synchronize all models
// db.sequelize.sync({ force: false }) // Use { force: true } to drop and re-create tables. Be cautious in production.
//   .then(() => {
//     console.log('Database & tables synced!');
//   })
//   .catch(err => {
//     console.error('Error syncing database:', err);
//   });

module.exports = db;
