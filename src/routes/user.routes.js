const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All routes below require authentication
router.use(protect);

// Self-service routes (any authenticated user)
router.get('/me', userController.getMe, userController.getUserById);
router.delete('/me', userController.deleteMe);

// Admin-only routes
router.use(restrictTo('admin'));

router.route('/')
  .get(userController.getAllUsers);

router.route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
