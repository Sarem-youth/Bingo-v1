const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BingoCard = sequelize.define('BingoCard', {
    card_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    card_data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    qr_code_data: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'bingo_cards',
    timestamps: false,
  });

  return BingoCard;
};
