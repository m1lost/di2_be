const app = require('./src/app');
const { sequelize } = require('./src/models');
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate(); // ini tk test koneksi ke database
    await sequelize.sync(); // ini untuk sinkronisasi model ke database, alter true untuk update tabel jika ada perubahan;
    console.log(`database terhubung`);

    app.listen(PORT, () => console.log(`server running pada port ${PORT}`));
  } catch (error) {
    console.error(`DB connection error`, error);
  }
})();
