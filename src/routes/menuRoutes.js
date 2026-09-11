const router = require('express').Router();

const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const trimMiddleware = require('../middleware/trimMiddleware');
const validateBody = require('../middleware/validateBody');

router.get('/', authMiddleware, rbacMiddleware('ADMIN'), menuController.getAll);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware('ADMIN'),
  menuController.getById
);

router.post(
  '/',
  authMiddleware,
  trimMiddleware,
  rbacMiddleware('ADMIN'),
  validateBody(['code', 'name']),
  menuController.create
);

router.put(
  '/:id',
  authMiddleware,
  trimMiddleware,
  rbacMiddleware('ADMIN'),
  validateBody(['code', 'name']),
  menuController.update
);

router.patch(
  '/:id/toggle-active',
  authMiddleware,
  rbacMiddleware('ADMIN'),
  menuController.toggleActive
);

module.exports = router;
