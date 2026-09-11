const { sequelize, User, Role, UserRole } = require('../src/models');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const adminNik = 'SUPRA';
    const password = 'admin123';

    const adminRole = await Role.findOne({
      where: { code: 'ADMIN' }
    });

    if (!adminRole) {
      console.error('Admin role not found. Run seedRoles.js first.');
      process.exit(1);
    }

    const [admin] = await User.findOrCreate({
      where: { nik: adminNik },
      defaults: {
        nik: adminNik,
        email: 'admin@di2.local',
        name: 'Super Admin',
        password,
        isVerified: true,
        isActive: true
      }
    });

    await UserRole.findOrCreate({
      where: {
        userId: admin.id,
        roleId: adminRole.id
      }
    });

    console.log('Admin seeded successfully');
    console.log('NIK:', adminNik);

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin:', error);
    process.exit(1);
  }
})();
