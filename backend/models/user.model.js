const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: { // Changed from password
      type: DataTypes.STRING(255), // Was TEXT
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(10), // Adjusted size
      allowNull: false,
      validate: {
        isIn: [['admin', 'agent', 'cashier']],
      },
    },
    parent_agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users', // Self-reference
        key: 'user_id',
      },
      onDelete: 'SET NULL',
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true, // Only for agents
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_by: { // Retained from existing
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users', // Self-reference
        key: 'user_id',
      },
      onDelete: 'SET NULL',
    },
    // Removed: full_name, email, phone_number, last_login, profile_picture_url, company_id (for cashier)
    // Timestamps are handled by Sequelize by default if not specified otherwise
  }, {
    tableName: 'users',
    timestamps: true, // Explicitly set though default
    // Hooks for password hashing (example)
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash') && user.password_hash) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
    },
    // Indexes from existing schema (can be reviewed based on new spec)
    // indexes: [
    //   { fields: ['role'] },
    //   { fields: ['created_by'] },
    //   { fields: ['parent_agent_id'] },
    // ],
  });

  // Instance method to check password (example)
  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  return User;
};
