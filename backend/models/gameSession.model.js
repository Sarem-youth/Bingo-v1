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
        model: 'companies', // Table name
        key: 'company_id',
      },
      onDelete: 'CASCADE',
    },
    cashier_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Table name
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
      allowNull: true, // Or false if a pattern is always required
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
      type: DataTypes.TEXT, // Could be JSON or comma-separated string
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('numbers_called');
        if (rawValue) {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            // If not JSON, return as is (e.g. comma-separated string)
            // Or handle specific format conversion if needed
            return rawValue.split(',').map(n => parseInt(n.trim(), 10));
          }
        }
        return [];
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
    // created_at is handled by Sequelize's timestamps option (if enabled)
    // The SQL schema has a `created_at` column, so ensure timestamps: true is set or manually define it.
  }, {
    tableName: 'game_sessions',
    timestamps: true, // This will add createdAt and updatedAt columns
    // If your SQL schema specifically names it `created_at` and doesn't have `updated_at`
    // you might need to configure: `updatedAt: false, createdAt: 'created_at'`
    // Based on the provided SQL, it seems only `created_at` is explicitly defined, not `updated_at`.
    // However, the table also has `start_time` and `end_time`.
    // For consistency with other models, using Sequelize defaults for `createdAt` and `updatedAt` is fine.
    // The SQL `created_at` can be mapped to Sequelize's `createdAt`.
    createdAt: 'created_at', // Explicitly map to the column name in the SQL
    updatedAt: 'updated_at', // Add this if you want Sequelize to manage it, or set to false
  });

  return GameSession;
};
