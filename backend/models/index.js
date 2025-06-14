const { sequelize, Sequelize } = require('../config/db.config.js'); // Use the exported sequelize instance and Sequelize library

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

// User self-referential associations for created_by and parent_agent_id
db.User.hasMany(db.User, { as: 'CreatedUsers', foreignKey: 'created_by', onDelete: 'SET NULL' });
db.User.belongsTo(db.User, { as: 'Creator', foreignKey: 'created_by', constraints: false }); // constraints: false if created_by can be null or refer to non-existent user after deletion

db.User.hasMany(db.User, { as: 'ManagedCashiersByAgent', foreignKey: 'parent_agent_id', onDelete: 'SET NULL' }); // Renamed for clarity
db.User.belongsTo(db.User, { as: 'ParentAgentForCashier', foreignKey: 'parent_agent_id', constraints: false }); // Renamed for clarity

// User (Agent) to Company
// An Agent registers multiple Companies. A Company is registered by one Agent.
db.User.hasMany(db.Company, { as: 'RegisteredCompanies', foreignKey: 'registered_by_agent_id' });
db.Company.belongsTo(db.User, { as: 'RegisteringAgent', foreignKey: 'registered_by_agent_id' });

// User (Cashier) to CashierAssignment
// A Cashier can have multiple assignments (historically). An assignment belongs to one Cashier.
db.User.hasMany(db.CashierAssignment, { as: 'AssignmentsAsCashier', foreignKey: 'cashier_user_id' }); // Renamed for clarity
db.CashierAssignment.belongsTo(db.User, { as: 'Cashier', foreignKey: 'cashier_user_id' });

// Company to CashierAssignment
// A Company can have multiple Cashier assignments. An assignment belongs to one Company.
db.Company.hasMany(db.CashierAssignment, { as: 'CashierAssignmentsForCompany', foreignKey: 'company_id' }); // Renamed for clarity
db.CashierAssignment.belongsTo(db.Company, { as: 'AssignedCompany', foreignKey: 'company_id' });

// Company to GameSession
// A Company can host multiple GameSessions. A GameSession belongs to one Company.
db.Company.hasMany(db.GameSession, { as: 'GameSessionsHosted', foreignKey: 'company_id' });
db.GameSession.belongsTo(db.Company, { as: 'HostingCompany', foreignKey: 'company_id' });

// User (Cashier) to GameSession
// A Cashier (User) can run multiple GameSessions. A GameSession is run by one Cashier.
db.User.hasMany(db.GameSession, { as: 'GameSessionsRunByCashier', foreignKey: 'cashier_user_id' });
db.GameSession.belongsTo(db.User, { as: 'RunningCashier', foreignKey: 'cashier_user_id' });

// GameSession to BingoCard
// A GameSession can have many BingoCards. A BingoCard belongs to one GameSession.
db.GameSession.hasMany(db.BingoCard, { as: 'CardsInSession', foreignKey: 'game_session_id' });
db.BingoCard.belongsTo(db.GameSession, { as: 'GameSession', foreignKey: 'game_session_id' });

// GameSession to Transaction
// A GameSession can have many Transactions. A Transaction can optionally belong to one GameSession.
db.GameSession.hasMany(db.Transaction, { as: 'TransactionsInSession', foreignKey: 'game_session_id' });
db.Transaction.belongsTo(db.GameSession, { as: 'GameSession', foreignKey: 'game_session_id' });

// User (Cashier) to Transaction (user_id on Transaction is the cashier who processed)
// A User (Cashier) processes many Transactions. A Transaction is processed by one User.
db.User.hasMany(db.Transaction, { as: 'ProcessedTransactions', foreignKey: 'user_id' });
db.Transaction.belongsTo(db.User, { as: 'ProcessingUser', foreignKey: 'user_id' });

// Company to Transaction
// A Company is associated with many Transactions. A Transaction belongs to one Company.
db.Company.hasMany(db.Transaction, { as: 'CompanyTransactions', foreignKey: 'company_id' });
db.Transaction.belongsTo(db.Company, { as: 'AssociatedCompany', foreignKey: 'company_id' });

// User (Agent) to Transaction (agent_id on Transaction is the agent associated with the company)
// An Agent (User) is associated with many Transactions. A Transaction is associated with one Agent.
db.User.hasMany(db.Transaction, { as: 'AgentTransactions', foreignKey: 'agent_id' });
db.Transaction.belongsTo(db.User, { as: 'AssociatedAgent', foreignKey: 'agent_id' });

// Transaction to BingoCard
// A Transaction (player_buy_in) can be linked to one BingoCard (as per current BingoCard.transaction_id FK).
// If one transaction could cover multiple cards, BingoCard would need a transaction_id,
// and Transaction could have many BingoCards. The current model BingoCard.transaction_id supports this.
db.Transaction.hasMany(db.BingoCard, { as: 'PurchasedCards', foreignKey: 'transaction_id' });
db.BingoCard.belongsTo(db.Transaction, { as: 'PurchaseTransaction', foreignKey: 'transaction_id' });


// Helper function to check if a user is an agent (example)
// You might put such helpers in a separate utility file or service
db.User.prototype.isAgent = function() {
  return this.role === 'agent';
};

db.User.prototype.isCashier = function() {
  return this.role === 'cashier';
};

db.User.prototype.isAdmin = function() {
  return this.role === 'admin';
};


// Sync all models that are not already in the database
// sequelize.sync({ alter: true }) // Use with caution in production, alter can be destructive.
//   .then(() => {
//     console.log('Database & tables synced!');
//   })
//   .catch(error => {
//     console.error('Error syncing database:', error);
//   });

module.exports = db;
