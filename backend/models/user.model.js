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
    created_by: { // Links agent/cashier to admin or agent who created them
      type: DataTypes.INTEGER,
      references: {
        model: 'users', // Table name for self-reference
        key: 'user_id',
      },
      onDelete: 'SET NULL',
      allowNull: true, // Nullable as per schema
    },
    parent_agent_id: { // Links a cashier to their parent agent
      type: DataTypes.INTEGER,
      references: {
        model: 'users', // Table name for self-reference
        key: 'user_id',
      },
      onDelete: 'SET NULL',
      allowNull: true, // Nullable as per schema
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 4), // e.g., 0.1000 for 10.00%
      allowNull: true, // Nullable, validation handles role-specific requirement
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // created_at and updated_at are handled by Sequelize's timestamps option
  }, {
    tableName: 'users',
    timestamps: true,
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
        if (this.role === 'agent' && (this.commission_rate === null || this.commission_rate === undefined)) {
          throw new Error('Commission rate is required for agents.');
        }
        if (this.role !== 'agent' && this.commission_rate !== null && this.commission_rate !== undefined) {
          throw new Error('Commission rate should only be set for agents.');
        }
      },
      parentAgentIdRole() {
        // parent_agent_id should only be set for cashiers and should refer to an agent.
        // The latter part (referring to an agent) is harder to enforce here without a direct query
        // and is better handled in service layer or via DB trigger.
        if (this.role === 'cashier' && (this.parent_agent_id === null || this.parent_agent_id === undefined)) {
          // This check might be too strict if an admin can create a cashier not initially assigned to an agent.
          // Based on the schema `parent_agent_id INTEGER REFERENCES Users(user_id) ON DELETE SET NULL`, it can be null.
          // So, we should only check that if parent_agent_id is set, the role is 'cashier'.
          // Or, if the role is 'cashier', parent_agent_id *can* be set.
        }
        if (this.role !== 'cashier' && this.parent_agent_id !== null && this.parent_agent_id !== undefined) {
          throw new Error('Parent agent ID should only be set for cashiers.');
        }
      },
      createdByRole() {
        // created_by can be null (e.g. for the first admin)
        // If created_by is set, the creator should ideally be an admin (for agents/cashiers)
        // or an agent (for cashiers). This is complex for model-level validation.
        // The SQL schema allows created_by to be any user.
        // We will rely on application logic to enforce creator roles.
      }
    }
  });

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};
