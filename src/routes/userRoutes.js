const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const trimMiddleware = require('../middleware/trimMiddleware');
const validateBody = require('../middleware/validateBody');

router.post(
  '/',
  authMiddleware,
  rbacMiddleware('ADMIN'),
  userController.create
);
router.get('/', authMiddleware, rbacMiddleware('ADMIN'), userController.getAll);
router.get('/:id', authMiddleware, userController.getById);
router.patch(
  '/:id/toggle-active',
  authMiddleware,
  rbacMiddleware('ADMIN'),
  userController.toggleActive
);

router.put(
  '/:id',
  authMiddleware,
  trimMiddleware,
  rbacMiddleware('ADMIN'),
  validateBody(['nik', 'name', 'email']),
  userController.update
);

router.put(
  '/:id/change-password',
  authMiddleware,
  validateBody(['password']),
  userController.updatePassword
);

router.put(
  '/:id/roles',
  authMiddleware,
  trimMiddleware,
  rbacMiddleware('ADMIN'),
  userController.setRoles
);

module.exports = router;
