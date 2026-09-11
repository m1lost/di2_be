const { User, Role, UserRole } = require('../models');
const {
  generatenikToken,
  verifynikToken,
  generateAccessToken,
  generateRoleToken
} = require('../utils/tokenUtil');
const { hasMaxLength, isValidPassword } = require('../utils/validation');

// Registrasi User
exports.register = async (req, res) => {
  try {
    const { nik, password } = req.body;

    if (!hasMaxLength(nik) || !hasMaxLength(password)) {
      return res.status(400).json({
        message: 'Input is too long. Max 225 Character'
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    const exist = await User.findOne({ where: { nik } });
    if (exist)
      return res.status(400).json({
        message: 'nik sudah terdaftar'
      });

    const user = await User.create({
      nik,
      password
    });

    // default user register role
    const role = await Role.findOne({ where: { name: 'user' } });
    if (!role) {
      return res.status(500).json({
        message: 'Default role not found'
      });
    }

    await UserRole.create({
      userId: user.id,
      roleId: role.id
    });

    // generate token untuk verifikasi nik
    const nikToken = generatenikToken(user);
    // send token verifikasi ke nik
    await sendVerificationnik(user.nik, nikToken);

    res.status(201).json({
      message: 'registrasi berhasil, silahkan verifikasi nik'
    });
  } catch (err) {
    res.status(500).json({
      message: 'register error'
    });
  }
};

// Verification nik User
exports.verifynik = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        message: 'Token is required'
      });
    }

    const payload = verifynikToken(token);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(400).json({ message: 'invalid token' });
    user.isVerified = true;

    await user.save();

    res.json({
      message: 'nik terverifikasi'
    });
  } catch (error) {
    res.status(400).json({
      message: 'verification failed',
      error: error.message
    });
  }
};

// Login User
exports.login = async (req, res) => {
  // implementasi login
  try {
    const { nik, password } = req.body;
    const user = await User.findOne({
      where: { nik },
      include: [
        {
          model: Role
        }
      ]
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid nik or password'
      });
    }

    // validasi password
    const isMatch = await user.comparePassword(password);

    if (!user.isActive)
      return res.status(403).json({ message: 'Account is not active' });
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid NIKr password' });

    // generate token untuk autentikasi (misal JWT)
    const authToken = generateAccessToken(user);

    res.json({
      message: 'Login berhasil',
      token: authToken
    });
  } catch (error) {
    res.status(500).json({
      message: 'Login error',
      error: error.message
    });
  }
};

exports.selectRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        message: 'Role is required'
      });
    }

    const user = await User.findByPk(req.user.id, {
      include: Role
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const selectedRole = user.Roles.find((item) => item.code === role);

    if (!selectedRole) {
      return res.status(403).json({
        message: 'Role is not assigned to this user'
      });
    }

    // generate token baru dengan active role
    const token = generateRoleToken(user, selectedRole.code);

    return res.status(200).json({
      message: 'Role selected successfully',
      role: selectedRole.code,
      token
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};
