const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CardStat = sequelize.define('CardStat', {
    card_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'bingo_cards', // Name of the table in DB
        key: 'card_id',
      },
      onDelete: 'CASCADE',
    },
    games_played: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_wins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_payouts: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
    },
    last_win_date: {
      type: DataTypes.DATE, // Sequelize uses DATE for TIMESTAMP WITH TIME ZONE
      allowNull: true,
    },
  }, {
    tableName: 'card_stats',
    timestamps: false, // As per the schema, no created_at/updated_at
  });

  return CardStat;
};
