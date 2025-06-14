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
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
    validate: {
      commissionRateOnlyForAgent() {
        if (this.role === 'agent' && (this.commission_rate === null || this.commission_rate === undefined)) {
          throw new Error('Commission rate is required for agents.');
        }
        if (this.role !== 'agent' && this.commission_rate !== null && this.commission_rate !== undefined) {
          throw new Error('Commission rate should only be set for agents.');
        }
      },
      parentAgentIdOnlyForCashier() {
        // Further validation that parent_agent_id refers to an 'agent' role user
        // would typically be handled in service layer or a more complex hook if needed.
        if (this.role === 'cashier' && (this.parent_agent_id === null || this.parent_agent_id === undefined)) {
          // Allowing null if admin creates cashier directly without agent yet, or if it's optional by design
          // Based on SQL: parent_agent_id INTEGER REFERENCES Users(user_id) ON DELETE SET NULL
          // The SQL constraint chk_parent_agent_id_role implies it must be NOT NULL for cashiers.
          // throw new Error('Parent agent ID is required for cashiers.');
        }
        if (this.role !== 'cashier' && this.parent_agent_id !== null && this.parent_agent_id !== undefined) {
          throw new Error('Parent agent ID should only be set for cashiers.');
        }
      }
    }
  });

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};
