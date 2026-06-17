const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  registerRules,
  loginRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules
} = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Public endpoints (login & register are rate-limited against brute-force)
router.options('/login', (req, res) => {
  res.setHeader('Allow', 'POST, OPTIONS');
  res.status(204).end();
});
router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login',    authLimiter, loginRules,    validate, authController.login);
router.post('/refresh',  authController.refreshToken);
router.post('/logout',   authController.logout);
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, validate, authController.resetPassword);

// Protected endpoints (require authentication)
router.use(protect);

router.route('/profile')
  .get(authController.getProfile)
  .patch(authController.updateProfile);

router.post('/change-password', changePasswordRules, validate, authController.changePassword);

module.exports = router;

