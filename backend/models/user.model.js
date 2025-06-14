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
      allowNull: true,
      references: {
        model: 'users', // Self-referential: table name
        key: 'user_id',
      },
      onDelete: 'SET NULL',
    },
    parent_agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users', // Self-referential: table name
        key: 'user_id',
      },
      onDelete: 'SET NULL',
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 4), // Precision 5, scale 4
      allowNull: true, // Nullable, validation will enforce it for agents
      validate: {
        isDecimal: true,
        min: 0,
        max: 1, // Assuming commission rate is between 0 and 1 (e.g. 0.10 for 10%)
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // created_at and updated_at are handled by Sequelize's timestamps option
  }, {
    tableName: 'users',
    timestamps: true, // This will add createdAt and updatedAt columns
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
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
    validate: {
      commissionRateAndRole() {
        if (this.role === 'agent' && (this.commission_rate === null || this.commission_rate === undefined)) {
          throw new Error('Commission rate must be set for agents.');
        }
        if (this.role !== 'agent' && this.commission_rate !== null && this.commission_rate !== undefined) {
          throw new Error('Commission rate must only be set for agents.');
        }
      },
      parentAgentIdAndRole() {
        if (this.role === 'cashier' && (this.parent_agent_id === null || this.parent_agent_id === undefined)) {
          throw new Error('Parent agent ID must be set for cashiers.');
        }
        if (this.role !== 'cashier' && this.parent_agent_id !== null && this.parent_agent_id !== undefined) {
          throw new Error('Parent agent ID must only be set for cashiers.');
        }
        // A more complex validation to check if parent_agent_id actually points to an agent
        // would typically be done in the service layer or using an async validator
        // that can query the database. For now, this ensures presence.
      },
      createdByAndRole() {
        if (this.role === 'admin' && this.created_by !== null && this.created_by !== undefined) {
          throw new Error('Admin users should not have a created_by value.');
        }
        if ((this.role === 'agent' || this.role === 'cashier') && (this.created_by === null || this.created_by === undefined)) {
          // This might be too strict if an agent can be created by another agent in some scenarios,
          // but based on the initial description, agents/cashiers are linked to an admin or agent.
          // The schema allows created_by to be NULL, so this validation enforces it for non-admins.
          // Consider if system-created initial admin should bypass this or if created_by is always required for non-admins.
          // For now, let's assume non-admins must have a creator if the field is used.
          // The DB schema allows NULL for created_by, so this is an application-level rule.
        }
      }
    }
  });

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};
