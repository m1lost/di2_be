const jwt = require('jsonwebtoken');

exports.generateNikToken = (user) => {
  try {
    return jwt.sign(
      {
        id: user.id,
        nik: user.nik
      },
      process.env.nik_TOKEN_SECRET,
      { expiresIn: '1d' }
    );
  } catch (error) {
    console.error('generate nik token error:', error);
    throw error;
  }
};

exports.verifyNikToken = (token) => {
  try {
    return jwt.verify(token, process.env.nik_TOKEN_SECRET);
  } catch (error) {
    console.error('verify nik token error:', error);
    throw error;
  }
};

exports.generateAccessToken = (user) => {
  try {
    return jwt.sign(
      {
        id: user.id,
        nik: user.nik,
        roles: user.Roles?.filter((r) => r.isActive).map((r) => r.code) || []
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
  } catch (error) {
    console.error('generate access token error:', error);
    throw error;
  }
};

exports.generateRoleToken = (user, role) => {
  try {
    return jwt.sign(
      {
        id: user.id,
        nik: user.nik,
        role,
        tokenType: 'ACCESS'
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
  } catch (error) {
    console.error('generate role token error:', error);
    throw error;
  }
};
