const { sequelize, Role } = require('../src/models');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const roles = [
      {
        code: 'ADMIN',
        name: 'Administrator',
        isActive: true
      },
      {
        code: 'SUPERVISOR',
        name: 'Supervisor',
        isActive: true
      },
      {
        code: 'STAFF',
        name: 'Staff',
        isActive: true
      }
    ];

    for (const role of roles) {
      await Role.findOrCreate({
        where: { code: role.code },
        defaults: role
      });
    }

    console.log('Roles seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed roles:', error);
    process.exit(1);
  }
})();
