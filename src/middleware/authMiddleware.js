const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(payload.id, {
      include: Role
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'Unauthorized'
      });
    }

    const userRoles = user.Roles.filter((r) => r.isActive).map((r) => r.code);

    // Jika token ACCESS punya active role,
    // pastikan role tersebut masih dimiliki user
    if (
      payload.tokenType === 'ACCESS' &&
      payload.role &&
      !userRoles.includes(payload.role)
    ) {
      return res.status(403).json({
        message: 'Role is no longer assigned to user'
      });
    }

    req.user = {
      id: user.id,
      nik: user.nik,
      email: user.email,

      // seluruh role user dari database
      roles: userRoles,

      // role aktif dari JWT setelah select-role
      role: payload.role || null,

      // ROLE_SELECTION / ACCESS
      tokenType: payload.tokenType
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
};
