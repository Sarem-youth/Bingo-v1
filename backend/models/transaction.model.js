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
      allowNull: true, // As per schema, can be null
      references: {
        model: 'game_sessions', // Corrected to table name
        key: 'game_session_id',
      },
      onDelete: 'SET NULL',
    },
    user_id: { // Cashier who processed
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Corrected to table name
        key: 'user_id',
      },
      onDelete: 'RESTRICT',
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies', // Corrected to table name
        key: 'company_id',
      },
      onDelete: 'RESTRICT',
    },
    agent_id: { // Agent associated with the company
      type: DataTypes.INTEGER,
      allowNull: false, // Based on description, this seems required
      references: {
        model: 'users', // Corrected to table name, refers to a User with 'agent' role
        key: 'user_id',
      },
      onDelete: 'RESTRICT',
    },
    // timestamp is handled by Sequelize's createdAt
    notes: {
      type: DataTypes.TEXT,
      allowNull: true, // Assuming notes are optional
    },
    // updated_at is handled by Sequelize's updatedAt
  }, {
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'timestamp',
    updatedAt: 'updated_at',
  });

  return Transaction;
};
