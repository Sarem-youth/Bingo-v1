const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Company = sequelize.define('Company', {
    company_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    registered_by_agent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Assuming your User model is named 'User' and table 'users'
        key: 'user_id',
      },
      onDelete: 'RESTRICT', // An agent must exist
    },
    contact_info: {
      type: DataTypes.TEXT,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'companies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // Add validation to ensure registered_by_agent_id refers to a user with the 'agent' role.
    // This is best done at the service layer before saving, or via a database trigger if complex.
  });

  return Company;
};
