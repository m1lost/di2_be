const { sequelize, User, Role, UserRole } = require('../models');
const { generateEmailToken } = require('../utils/tokenUtil');
const { sendVerificationEmail } = require('../services/mailService');
const { Op } = require('sequelize');
const {
  hasMaxLength,
  isValidPassword,
  isValidEmail
} = require('../utils/validation');
const userRole = require('../models/userRole');

// Create User
exports.create = async (req, res) => {
  try {
    const { nik, name, email, password, roleIds = [] } = req.body;

    if (!nik || !name || !email || !password) {
      return res.status(400).json({
        message: 'NIK, name, email, and password are required'
      });
    }

    if (!hasMaxLength(nik) || !hasMaxLength(name) || !hasMaxLength(email)) {
      return res.status(400).json({
        message: 'Input is too long. Max 225 characters'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      });
    }

    const normalizedNik = nik.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ nik: normalizedNik }, { email: normalizedEmail }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'NIK or email already exists'
      });
    }

    let roles = [];

    if (roleIds.length > 0) {
      roles = await Role.findAll({
        where: {
          id: roleIds,
          isActive: true
        }
      });

      if (roles.length !== roleIds.length) {
        return res.status(400).json({
          message: 'One or more roles are invalid or inactive'
        });
      }
    }

    const user = await User.create({
      nik: normalizedNik,
      name: normalizedName,
      email: normalizedEmail,
      password,
      isActive: true
    });

    if (roles.length > 0) {
      await user.setRoles(roles);
    }

    const createdUser = await User.findByPk(user.id, {
      attributes: {
        exclude: ['password']
      },
      include: [
        {
          model: Role,
          attributes: ['id', 'code', 'name'],
          through: {
            attributes: []
          }
        }
      ]
    });

    return res.status(201).json({
      message: 'User created successfully',
      data: createdUser
    });
  } catch (error) {
    console.error('Create user error:', error);

    return res.status(500).json({
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// Get All Users
exports.getAll = async (req, res) => {
  try {
    const user = await User.findAll({
      attributes: {
        exclude: ['password']
      },
      order: [['email', 'ASC']],
      include: Role
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User By ID
exports.getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ['password']
      },
      include: Role
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update toggle Users isActive
exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    const { password, ...userWithoutPassword } = user.toJSON();

    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nik, name, email, roleIds = [] } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (!nik || !name || !email) {
      return res.status(400).json({
        message: 'NIK, name, and email are required'
      });
    }

    if (!hasMaxLength(nik) || !hasMaxLength(name) || !hasMaxLength(email)) {
      return res.status(400).json({
        message: 'Input is too long. Max 225 characters'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    const normalizedNik = nik.trim();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      where: {
        id: {
          [Op.ne]: id
        },
        [Op.or]: [{ nik: normalizedNik }, { email: normalizedEmail }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'NIK or email already exists'
      });
    }

    let roles = [];

    if (roleIds.length > 0) {
      roles = await Role.findAll({
        where: {
          id: roleIds,
          isActive: true
        }
      });

      if (roles.length !== roleIds.length) {
        return res.status(400).json({
          message: 'One or more roles are invalid or inactive'
        });
      }
    }

    await user.update({
      nik: normalizedNik,
      name: normalizedName,
      email: normalizedEmail
    });

    if (roleIds.length > 0) {
      await user.setRoles(roles);
    }

    const updatedUser = await User.findByPk(id, {
      attributes: {
        exclude: ['password']
      },
      include: [
        {
          model: Role,
          attributes: ['id', 'code', 'name'],
          through: {
            attributes: []
          }
        }
      ]
    });

    return res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);

    return res.status(500).json({
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Update Password User By ID
exports.updatePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (password && !hasMaxLength(password)) {
      return res.status(400).json({
        message: 'Input is too long. Max 225 Character'
      });
    }

    if (password && !isValidPassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};

    if (password) {
      updateData.password = password;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No data to update'
      });
    }

    await user.update(updateData);

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Role User
exports.setRoles = async (req, res) => {
  try {
    const { roleIds } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const roles = await Role.findAll({
      where: {
        id: roleIds
      }
    });

    if (roles.length !== roleIds.length) {
      return res.status(404).json({
        message: 'Roles not found'
      });
    }

    await user.setRoles(roles);

    const updated = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ['password']
      },
      include: [
        {
          model: Role,
          through: {
            attributes: []
          }
        }
      ]
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};
