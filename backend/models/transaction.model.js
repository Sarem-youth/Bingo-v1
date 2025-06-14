const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    transaction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    session_id: { // Renamed from game_session_id
      type: DataTypes.INTEGER,
      allowNull: true, // As per new schema (was false in old model if game_session_id)
      references: {
        model: 'game_sessions', // Corrected to table name
        key: 'session_id', // Corrected to new PK name
      },
      onDelete: 'SET NULL',
    },
    cashier_id: { // Added
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Corrected to table name
        key: 'user_id',
      },
      onDelete: 'RESTRICT',
    },
    type: {
      type: DataTypes.STRING(15), // Adjusted size
      allowNull: false,
      validate: {
        isIn: [['buy_in', 'payout', 'reconciliation']],
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    notes: { // Retained from existing
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: { // Retained from existing, default changed in SQL
      type: DataTypes.DATE, // Sequelize uses DATE for TIMESTAMP WITH TIME ZONE
      defaultValue: DataTypes.NOW,
    },
    // user_id: { // Removed, replaced by cashier_id
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'users',
    //     key: 'user_id',
    //   },
    //   onDelete: 'RESTRICT',
    // },
    // company_id: { // Removed
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'companies',
    //     key: 'company_id',
    //   },
    //   onDelete: 'RESTRICT',
    // },
    // agent_id: { // Removed
    //   type: DataTypes.INTEGER,
    //   allowNull: true, // Was false in old model
    //   references: {
    //     model: 'users',
    //     key: 'user_id',
    //   },
    //   onDelete: 'RESTRICT',
    // },
    // transaction_reference: { // Removed
    //   type: DataTypes.STRING(255),
    //   allowNull: true,
    // },
    // payment_method: { // Removed
    //   type: DataTypes.STRING(50),
    //   allowNull: true,
    // },
  }, {
    tableName: 'transactions',
    timestamps: false, // New schema doesn't show created_at/updated_at, but has 'timestamp' field
    // createdAt: 'created_at', // Removed
    // updatedAt: 'updated_at', // Removed
  });

  return Transaction;
};
