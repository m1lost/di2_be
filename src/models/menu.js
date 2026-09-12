const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Menu = sequelize.define(
    'Menu',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'menus',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },

      code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false
      },

      path: {
        type: DataTypes.STRING,
        allowNull: true
      },

      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }
    },
    {
      tableName: 'menus'
    }
  );

  return Menu;
};
