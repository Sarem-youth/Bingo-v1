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
db.User.belongsTo(db.User, { as: 'Creator', foreignKey: 'created_by' });

db.User.hasMany(db.User, { as: 'ManagedCashiers', foreignKey: 'parent_agent_id', onDelete: 'SET NULL' });
db.User.belongsTo(db.User, { as: 'ParentAgent', foreignKey: 'parent_agent_id' });

// User (Agent) to Company
// An Agent registers multiple Companies. A Company is registered by one Agent.
db.User.hasMany(db.Company, { as: 'RegisteredCompanies', foreignKey: 'registered_by_agent_id' });
db.Company.belongsTo(db.User, { as: 'RegisteringAgent', foreignKey: 'registered_by_agent_id' });

// User (Cashier) to CashierAssignment
// A Cashier can have multiple assignments. An assignment belongs to one Cashier.
db.User.hasMany(db.CashierAssignment, { as: 'Assignments', foreignKey: 'cashier_user_id' });
db.CashierAssignment.belongsTo(db.User, { as: 'Cashier', foreignKey: 'cashier_user_id' });

// Company to CashierAssignment
// A Company can have multiple Cashier assignments. An assignment belongs to one Company.
db.Company.hasMany(db.CashierAssignment, { as: 'CashierLinks', foreignKey: 'company_id' });
db.CashierAssignment.belongsTo(db.Company, { as: 'AssignedCompany', foreignKey: 'company_id' });

// User (Cashier) to GameSession
// A Cashier runs multiple GameSessions. A GameSession is run by one Cashier.
db.User.hasMany(db.GameSession, { as: 'OperatedGameSessions', foreignKey: 'cashier_user_id' });
db.GameSession.belongsTo(db.User, { as: 'OperatorCashier', foreignKey: 'cashier_user_id' });

// Company to GameSession
// A Company hosts multiple GameSessions. A GameSession belongs to one Company.
db.Company.hasMany(db.GameSession, { as: 'HostedGameSessions', foreignKey: 'company_id' });
db.GameSession.belongsTo(db.Company, { as: 'HostingCompany', foreignKey: 'company_id' });

// GameSession to BingoCard
// A GameSession has multiple BingoCards. A BingoCard belongs to one GameSession.
db.GameSession.hasMany(db.BingoCard, { as: 'CardsInSession', foreignKey: 'game_session_id' });
db.BingoCard.belongsTo(db.GameSession, { as: 'Session', foreignKey: 'game_session_id' });

// Transaction Associations

// Transaction to GameSession
db.Transaction.belongsTo(db.GameSession, { as: 'RelatedGameSession', foreignKey: 'game_session_id', allowNull: true });
db.GameSession.hasMany(db.Transaction, { as: 'SessionTransactions', foreignKey: 'game_session_id' });

// Transaction to User (Cashier who processed)
db.Transaction.belongsTo(db.User, { as: 'ProcessingUser', foreignKey: 'user_id' });
db.User.hasMany(db.Transaction, { as: 'ProcessedTransactions', foreignKey: 'user_id' });

// Transaction to Company
db.Transaction.belongsTo(db.Company, { as: 'RelatedCompany', foreignKey: 'company_id' });
db.Company.hasMany(db.Transaction, { as: 'CompanyTransactions', foreignKey: 'company_id' });

// Transaction to User (Agent associated with the company)
db.Transaction.belongsTo(db.User, { as: 'AssociatedAgent', foreignKey: 'agent_id' });
// Note: A user can be an agent for multiple transactions.
// If you need to distinguish transactions processed by a user vs. transactions associated with an agent user:
// db.User.hasMany(db.Transaction, { as: 'AgentLinkedTransactions', foreignKey: 'agent_id' });
// This might conflict if 'user_id' and 'agent_id' are part of the same 'hasMany' on User without different aliases.
// For clarity, ensure aliases are distinct if a User model has multiple foreign keys to the Transaction model.
// The current setup implies 'ProcessedTransactions' are by user_id (cashier) and 'AssociatedAgent' links to agent_id.

// Transaction to BingoCard (A buy-in transaction might be linked to a card)
// A transaction can be for one bingo card purchase. A bingo card is purchased via one transaction.
db.Transaction.hasOne(db.BingoCard, { as: 'PurchaseCard', foreignKey: 'transaction_id', allowNull: true });
db.BingoCard.belongsTo(db.Transaction, { as: 'BuyInTransaction', foreignKey: 'transaction_id', allowNull: true });


// Sync all models that are not already in the database
// sequelize.sync({ alter: true }) // Use with caution in production, alter can be destructive.
//   .then(() => {
//     console.log('Database & tables synced!');
//   })
//   .catch(error => {
//     console.error('Error syncing database:', error);
//   });

module.exports = db;
