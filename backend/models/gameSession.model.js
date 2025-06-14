const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GameSession = sequelize.define('GameSession', {
    session_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    start_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    picked_numbers: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['active', 'paused', 'finished']],
      },
    },
    winning_pattern: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    total_buy_in: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
    },
    prize_payout: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
    },
  }, {
    tableName: 'game_sessions',
    timestamps: true,
  });

  return GameSession;
};
