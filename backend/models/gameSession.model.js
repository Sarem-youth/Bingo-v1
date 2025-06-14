const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GameSession = sequelize.define('GameSession', {
    game_session_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies', // table name
        key: 'company_id',
      },
      onDelete: 'CASCADE',
    },
    cashier_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // table name
        key: 'user_id',
      },
      onDelete: 'RESTRICT', // A cashier must exist
    },
    start_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    winning_pattern: {
      type: DataTypes.STRING(255),
      allowNull: true, // Can be null if not applicable or set later
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      allowNull: false,
      validate: {
        isIn: [['pending', 'active', 'completed', 'cancelled']],
      },
    },
    jackpot_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    numbers_called: {
      type: DataTypes.TEXT, // Could be JSON array or comma-separated string
      allowNull: true,
    },
    last_called_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // created_at and updated_at are handled by Sequelize's timestamps option
  }, {
    tableName: 'game_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return GameSession;
};
