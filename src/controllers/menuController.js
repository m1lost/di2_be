const { Menu } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      attributes: [
        'id',
        'parentId',
        'code',
        'name',
        'path',
        'sortOrder',
        'isActive'
      ],
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC']
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Menus retrieved successfully',
      data: menus
    });
  } catch (error) {
    console.error('Get menus error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve menus'
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findByPk(id, {
      attributes: [
        'id',
        'parentId',
        'code',
        'name',
        'path',
        'sortOrder',
        'isActive'
      ]
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Menu retrieved successfully',
      data: menu
    });
  } catch (error) {
    console.error('Get menu detail error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu'
    });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      parentId = null,
      code,
      name,
      path = null,
      sortOrder = 0
    } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Code and name are required'
      });
    }

    const normalizedCode = code.trim().toUpperCase();
    const normalizedName = name.trim();
    const normalizedPath = path ? path.trim() : null;

    const existingMenu = await Menu.findOne({
      where: {
        code: normalizedCode
      }
    });

    if (existingMenu) {
      return res.status(409).json({
        success: false,
        message: 'Menu code already exists'
      });
    }

    if (parentId) {
      const parentMenu = await Menu.findByPk(parentId);

      if (!parentMenu) {
        return res.status(404).json({
          success: false,
          message: 'Parent menu not found'
        });
      }
    }

    const menu = await Menu.create({
      parentId,
      code: normalizedCode,
      name: normalizedName,
      path: normalizedPath,
      sortOrder,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Menu created successfully',
      data: menu
    });
  } catch (error) {
    console.error('Create menu error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create menu'
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { parentId, code, name, path, sortOrder } = req.body;

    const menu = await Menu.findByPk(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    if (
      parentId === undefined &&
      !code &&
      !name &&
      path === undefined &&
      sortOrder === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'No data to update'
      });
    }

    if (parentId !== undefined) {
      if (parentId === id) {
        return res.status(400).json({
          success: false,
          message: 'Menu cannot be its own parent'
        });
      }

      if (parentId !== null) {
        const parentMenu = await Menu.findByPk(parentId);

        if (!parentMenu) {
          return res.status(404).json({
            success: false,
            message: 'Parent menu not found'
          });
        }

        // Prevent circular hierarchy
        let currentParent = parentMenu;

        while (currentParent) {
          if (currentParent.id === id) {
            return res.status(400).json({
              success: false,
              message: 'Circular menu hierarchy is not allowed'
            });
          }

          if (!currentParent.parentId) {
            break;
          }

          currentParent = await Menu.findByPk(currentParent.parentId);
        }
      }

      menu.parentId = parentId;
    }

    if (code) {
      menu.code = code.trim().toUpperCase();
    }

    if (name) {
      menu.name = name.trim();
    }

    if (path !== undefined) {
      menu.path = path ? path.trim() : null;
    }

    if (sortOrder !== undefined) {
      menu.sortOrder = sortOrder;
    }

    await menu.save();

    return res.status(200).json({
      success: true,
      message: 'Menu updated successfully',
      data: menu
    });
  } catch (error) {
    console.error('Update menu error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Menu code already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update menu'
    });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findByPk(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    menu.isActive = !menu.isActive;

    await menu.save();

    return res.status(200).json({
      success: true,
      message: `Menu ${
        menu.isActive ? 'activated' : 'deactivated'
      } successfully`,
      data: {
        id: menu.id,
        parentId: menu.parentId,
        code: menu.code,
        name: menu.name,
        path: menu.path,
        sortOrder: menu.sortOrder,
        isActive: menu.isActive
      }
    });
  } catch (error) {
    console.error('Toggle menu status error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update menu status'
    });
  }
};
