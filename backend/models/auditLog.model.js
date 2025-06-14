const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // As per schema, can be null if user is deleted
      references: {
        model: 'users', // Name of the table in DB
        key: 'user_id',
      },
      onDelete: 'SET NULL',
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE, // Sequelize uses DATE for TIMESTAMP WITH TIME ZONE
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'audit_log',
    timestamps: false, // Schema has its own 'timestamp' field, not created_at/updated_at
  });

  return AuditLog;
};
