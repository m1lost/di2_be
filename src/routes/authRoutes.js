const router = require('express').Router();
const authController = require('../controllers/authController');
const validateBody = require('../middleware/validateBody');
const trimMiddleware = require('../middleware/trimMiddleware');

router.post(
  '/login',
  trimMiddleware,
  validateBody(['nik', 'password']),
  authController.login
);

module.exports = router;
