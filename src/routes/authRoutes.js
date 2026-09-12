const router = require('express').Router();
const authController = require('../controllers/authController');
const validateBody = require('../middleware/validateBody');
const trimMiddleware = require('../middleware/trimMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.post(
  '/login',
  trimMiddleware,
  validateBody(['nik', 'password']),
  authController.login
);

router.post('/select-role', authMiddleware, authController.selectRole);
router.get('/my-menus', authMiddleware, authController.getMyMenus);

module.exports = router;
