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

// Public endpoints
router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, validate, authController.resetPassword);

// Protected endpoints (require authentication)
router.use(protect); // Applies protect middleware to all routes below this line

router.route('/profile')
  .get(authController.getProfile)
  .patch(authController.updateProfile);

router.post('/change-password', changePasswordRules, validate, authController.changePassword);

module.exports = router;
