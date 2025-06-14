const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    transaction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['player_buy_in', 'payout', 'agent_commission_payout', 'admin_commission']],
      },
    },
    game_session_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be null if it's a payout not tied to a specific game (e.g. agent commission)
      references: {
        model: 'game_sessions', // Table name
        key: 'game_session_id',
      },
      onDelete: 'SET NULL',
    },
    user_id: { // Cashier who processed or user involved (e.g. agent for their commission payout)
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Table name
        key: 'user_id',
      },
      onDelete: 'RESTRICT', // A user must exist for a transaction
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Nullable for admin/agent payouts not tied to a specific company
      references: {
        model: 'companies', // Table name
        key: 'company_id',
      },
      onDelete: 'SET NULL',
    },
    agent_id: { // The agent associated with the company where the transaction occurred, or the agent receiving commission
      type: DataTypes.INTEGER,
      allowNull: true, // Nullable for admin transactions or direct player payouts not via agent
      references: {
        model: 'users', // Table name, refers to a user with 'agent' role
        key: 'user_id',
      },
      onDelete: 'SET NULL',
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    // created_at and updated_at are handled by Sequelize's timestamps option
  }, {
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at', // Or use default 'createdAt'
    updatedAt: 'updated_at', // Or use default 'updatedAt'
    // Sequelize by default uses createdAt and updatedAt. If your SQL schema uses `timestamp` for the transaction time,
    // and you want separate audit trails, you might need to adjust. The current SQL has `timestamp`.
    // If `timestamp` is the primary time for the transaction event, then `createdAt` and `updatedAt` are for the record itself.
  });

  // Add model-level validations if needed, e.g., ensuring agent_id refers to an agent.
  // This is often better handled in service layers or through database triggers/constraints if complex.

  return Transaction;
};
