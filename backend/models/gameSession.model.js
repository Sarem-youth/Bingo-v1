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
        model: 'companies', // Corrected to table name
        key: 'company_id',
      },
      onDelete: 'CASCADE',
    },
    cashier_user_id: { // Cashier running the game
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Corrected to table name
        key: 'user_id',
      },
      onDelete: 'RESTRICT',
    },
    start_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true, // Can be null if session is active
    },
    winning_pattern: {
      type: DataTypes.STRING(255), // e.g., 'single_line', 'four_corners', 'blackout'
      allowNull: true, // May not be set initially
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
      allowNull: false,
    },
    numbers_called: {
      type: DataTypes.TEXT, // Storing as JSON string or comma-separated
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('numbers_called');
        try {
          return rawValue ? JSON.parse(rawValue) : [];
        } catch (e) {
          return rawValue ? rawValue.split(',') : [];
        }
      },
      set(value) {
        if (Array.isArray(value)) {
          this.setDataValue('numbers_called', JSON.stringify(value));
        } else {
          this.setDataValue('numbers_called', value);
        }
      },
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
