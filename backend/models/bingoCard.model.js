const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BingoCard = sequelize.define('BingoCard', {
    card_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    game_session_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // A card must belong to a game session
      references: {
        model: 'game_sessions', // Corrected to table name
        key: 'game_session_id',
      },
      onDelete: 'CASCADE',
    },
    player_identifier: {
      type: DataTypes.STRING(255),
      allowNull: true, // Could be anonymous play
    },
    card_data: {
      type: DataTypes.JSONB, // Stores the 5x5 grid
      allowNull: false,
    },
    is_winner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
    },
    // purchased_at is handled by Sequelize's createdAt timestamp
    transaction_id: { // Link to the buy-in transaction
      type: DataTypes.INTEGER,
      allowNull: true, // May not always be linked, or linked later
      references: {
        model: 'transactions', // Corrected to table name
        key: 'transaction_id',
      },
      onDelete: 'SET NULL',
    },
    // updated_at is handled by Sequelize's updatedAt timestamp
  }, {
    tableName: 'bingo_cards',
    timestamps: true,
    createdAt: 'purchased_at',
    updatedAt: 'updated_at',
  });

  return BingoCard;
};
