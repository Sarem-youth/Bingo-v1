const { sequelize, Sequelize } = require('../config/db.config.js'); // Use the exported sequelize instance and Sequelize library

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.User = require('./user.model.js')(sequelize, Sequelize.DataTypes);
db.Company = require('./company.model.js')(sequelize, Sequelize.DataTypes);
db.Transaction = require('./transaction.model.js')(sequelize, Sequelize.DataTypes);
db.GameSession = require('./gameSession.model.js')(sequelize, Sequelize.DataTypes);
db.BingoCard = require('./bingoCard.model.js')(sequelize, Sequelize.DataTypes);
db.CardStat = require('./cardStat.model.js')(sequelize, Sequelize.DataTypes);
db.AuditLog = require('./auditLog.model.js')(sequelize, Sequelize.DataTypes);


// Define associations

// User self-referential associations for created_by and parent_agent_id
db.User.hasMany(db.User, { as: 'CreatedUsers', foreignKey: 'created_by', onDelete: 'SET NULL' });
db.User.belongsTo(db.User, { as: 'Creator', foreignKey: 'created_by', constraints: false }); // constraints: false if created_by can be null or refer to non-existent user after deletion

db.User.hasMany(db.User, { as: 'ManagedCashiersByAgent', foreignKey: 'parent_agent_id', onDelete: 'SET NULL' }); // Renamed for clarity
db.User.belongsTo(db.User, { as: 'ParentAgentForCashier', foreignKey: 'parent_agent_id', constraints: false }); // Renamed for clarity

// User (Agent) to Company
// An Agent registers multiple Companies. A Company is registered by one Agent.
db.User.hasMany(db.Company, {
  foreignKey: 'registered_by_agent_id',
  as: 'RegisteredCompanies'
});
db.Company.belongsTo(db.User, {
  foreignKey: 'registered_by_agent_id',
  as: 'RegisteringAgent'
});

// BingoCard to CardStat (One-to-One)
db.BingoCard.hasOne(db.CardStat, { foreignKey: 'card_id', as: 'Stats', onDelete: 'CASCADE' });
db.CardStat.belongsTo(db.BingoCard, { foreignKey: 'card_id', as: 'Card' });

// GameSession to Transaction (One-to-Many)
db.GameSession.hasMany(db.Transaction, { foreignKey: 'session_id', as: 'Transactions' });
db.Transaction.belongsTo(db.GameSession, { foreignKey: 'session_id', as: 'GameSession' });

// User (Cashier) to Transaction (One-to-Many)
db.User.hasMany(db.Transaction, { foreignKey: 'cashier_id', as: 'ProcessedTransactions' });
db.Transaction.belongsTo(db.User, { foreignKey: 'cashier_id', as: 'Cashier' });

// User to AuditLog (One-to-Many)
db.User.hasMany(db.AuditLog, { foreignKey: 'user_id', as: 'AuditLogs' });
db.AuditLog.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });


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
