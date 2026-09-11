const { Role } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ['id', 'code', 'name', 'isActive'],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully',
      data: roles
    });
  } catch (error) {
    console.error('Get roles error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve roles'
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      attributes: ['id', 'code', 'name', 'isActive']
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Role retrieved successfully',
      data: role
    });
  } catch (error) {
    console.error('Get role detail error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve role'
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { code, name } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Code and name are required'
      });
    }

    const normalizedCode = code.trim().toUpperCase();
    const normalizedName = name.trim();

    const existingRole = await Role.findOne({
      where: {
        code: normalizedCode
      }
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: 'Role code already exists'
      });
    }

    const role = await Role.create({
      code: normalizedCode,
      name: normalizedName,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    console.error('Create role error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create role'
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    if (!code && !name) {
      return res.status(400).json({
        success: false,
        message: 'Code or name is required'
      });
    }

    if (code) {
      role.code = code.trim().toUpperCase();
    }

    if (name) {
      role.name = name.trim();
    }

    await role.save();

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    console.error('Update role error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Role code or name already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update role'
    });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    role.isActive = !role.isActive;

    await role.save();

    return res.status(200).json({
      success: true,
      message: `Role ${role.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: role.id,
        code: role.code,
        name: role.name,
        isActive: role.isActive
      }
    });
  } catch (error) {
    console.error('Toggle role status error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update role status'
    });
  }
};
