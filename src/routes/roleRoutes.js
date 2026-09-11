const router = require('express').Router();

const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const trimMiddleware = require('../middleware/trimMiddleware');
const validateBody = require('../middleware/validateBody');

router.get('/', authMiddleware, rbacMiddleware('ADMIN'), roleController.getAll);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware('ADMIN'),
  roleController.getById
);

router.post(
  '/',
  authMiddleware,
  trimMiddleware,
  rbacMiddleware('ADMIN'),
  validateBody(['code', 'name']),
  roleController.create
);

router.put(
  '/:id',
  authMiddleware,
  trimMiddleware,
  rbacMiddleware('ADMIN'),
  validateBody(['code', 'name']),
  roleController.update
);

router.patch(
  '/:id/toggle-active',
  authMiddleware,
  rbacMiddleware('ADMIN'),
  roleController.toggleStatus
);

module.exports = router;
