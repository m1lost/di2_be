// config Sequelize
const { Sequelize } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// config Sequelize

const User = require('./user')(sequelize);
const Role = require('./role')(sequelize);
const UserRole = require('./userRole')(sequelize);
const Menu = require('./menu')(sequelize);

// many-to-many relation
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'userId'
});
Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'roleId'
});

Menu.belongsTo(Menu, {
  as: 'parent',
  foreignKey: 'parentId'
});

Menu.hasMany(Menu, {
  as: 'children',
  foreignKey: 'parentId'
});

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  Menu
};
