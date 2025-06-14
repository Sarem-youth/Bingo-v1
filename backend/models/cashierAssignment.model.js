const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CashierAssignment = sequelize.define('CashierAssignment', {
    assignment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cashier_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Corrected to table name
        key: 'user_id',
      },
      onDelete: 'CASCADE',
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies', // Corrected to table name
        key: 'company_id',
      },
      onDelete: 'CASCADE',
    },
    // assigned_at is handled by Sequelize's createdAt timestamp
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // updated_at is handled by Sequelize's updatedAt timestamp
  }, {
    tableName: 'cashier_assignments',
    timestamps: true,
    createdAt: 'assigned_at',
    updatedAt: 'updated_at', // Assuming schema will have updated_at or managed by Sequelize
    indexes: [
      {
        unique: true,
        fields: ['cashier_user_id', 'company_id'],
        name: 'unique_cashier_company_assignment' // Optional: specify index name
      },
      // The partial unique constraint for (cashier_user_id) WHERE is_active = TRUE
      // as per the SQL (unique_active_cashier_assignment) is more complex for Sequelize directly.
      // It often requires a raw query for index creation or a database-level constraint.
      // For now, we rely on application logic or a simpler unique constraint on (cashier_user_id, is_active) if that fits.
    ]
  });

  // Add model validation if needed, e.g., ensuring cashier_user_id refers to a 'cashier' role.
  // This is typically better handled at the service layer.

  return CashierAssignment;
};
