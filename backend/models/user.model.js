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
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['admin', 'agent', 'cashier']],
      },
    },
    created_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Self-reference
        key: 'user_id',
      },
      onDelete: 'SET NULL',
    },
    parent_agent_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Self-reference
        key: 'user_id',
      },
      onDelete: 'SET NULL',
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 4), // e.g., 0.1000 for 10.00%
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'users', // Explicitly set table name
    timestamps: true, // Sequelize will add createdAt and updatedAt
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
    validate: {
      commissionRateRole() {
        if (this.role === 'agent' && this.commission_rate === null) {
          throw new Error('Commission rate is required for agents.');
        }
        if (this.role !== 'agent' && this.commission_rate !== null) {
          throw new Error('Commission rate should only be set for agents.');
        }
      },
      parentAgentIdRole() {
        // This validation is tricky with Sequelize hooks alone if parent_agent_id's role needs checking.
        // It's often better handled at the service/controller layer or with database triggers.
        // Here, we ensure parent_agent_id is set for cashiers.
        if (this.role === 'cashier' && this.parent_agent_id === null) {
          // This might be too strict if a cashier can be created by an admin directly without an agent initially.
          // Adjust based on exact business rules.
          // throw new Error('Parent agent ID is required for cashiers.');
        }
      }
    }
  });

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};
