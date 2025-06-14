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
      allowNull: true, // May not be linked to a game session (e.g., commission payouts)
      references: {
        model: 'game_sessions', // table name
        key: 'game_session_id',
      },
      onDelete: 'SET NULL',
    },
    user_id: { // Cashier who processed or is related to the transaction
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // table name
        key: 'user_id',
      },
      onDelete: 'RESTRICT',
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies', // table name
        key: 'company_id',
      },
      onDelete: 'RESTRICT',
    },
    agent_id: { // Agent associated with the company for this transaction
      type: DataTypes.INTEGER,
      allowNull: false, // Assuming all game-related transactions will have an associated agent via the company
      references: {
        model: 'users', // table name
        key: 'user_id',
      },
      onDelete: 'RESTRICT',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // timestamp is handled by Sequelize's createdAt timestamp
  }, {
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'timestamp', // Using 'timestamp' as per the SQL schema
    updatedAt: 'updated_at', // Sequelize will add this, ensure it's in your DB or disable it if not needed
  });

  return Transaction;
};
