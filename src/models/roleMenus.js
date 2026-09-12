const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoleMenu = sequelize.define(
    'RoleMenu',
    {
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      menuId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'menus',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    },
    {
      tableName: 'role_menus'
    }
  );

  return RoleMenu;
};
