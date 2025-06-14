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
        model: 'users', // Corrected to table name
        key: 'user_id',
      },
      onDelete: 'RESTRICT', // An agent must exist
    },
    // created_at and updated_at are handled by Sequelize's timestamps option
  }, {
    tableName: 'companies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Company;
};
