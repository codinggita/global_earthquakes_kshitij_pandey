const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendNoContent } = require('../utils/responseFormatter');

/**
 * @desc      Get all users
 * @route     GET /api/v1/users
 * @access    Private (Admin only)
 */
const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  sendSuccess(res, { users }, `${users.length} users found.`);
});

/**
 * @desc      Get a single user by ID
 * @route     GET /api/v1/users/:id
 * @access    Private (Admin only)
 */
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError(`No user found with ID: ${req.params.id}`, 404));
  }
  sendSuccess(res, { user });
});

/**
 * @desc      Update a user's name, email, or role (admin operation)
 * @route     PATCH /api/v1/users/:id
 * @access    Private (Admin only)
 */
const updateUser = asyncHandler(async (req, res, next) => {
  // Only allow safe fields to be updated via this route
  const allowedFields = {};
  if (req.body.name)  allowedFields.name  = req.body.name;
  if (req.body.email) allowedFields.email = req.body.email;
  if (req.body.role)  allowedFields.role  = req.body.role;

  const user = await User.findByIdAndUpdate(req.params.id, allowedFields, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError(`No user found with ID: ${req.params.id}`, 404));
  }

  sendSuccess(res, { user }, 'User updated successfully.');
});

/**
 * @desc      Soft-delete (deactivate) a user
 * @route     DELETE /api/v1/users/:id
 * @access    Private (Admin only)
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  // Soft-delete: set active = false, consistent with the pre-find hook on the model
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );

  if (!user) {
    return next(new AppError(`No user found with ID: ${req.params.id}`, 404));
  }

  sendNoContent(res);
});

/**
 * @desc      Get currently logged-in user's own profile
 * @route     GET /api/v1/users/me
 * @access    Private (Any authenticated user)
 */
const getMe = asyncHandler(async (req, res, next) => {
  req.params.id = req.user.id;
  next(); // Forward to getUserById
});

/**
 * @desc      Deactivate own account (soft-delete)
 * @route     DELETE /api/v1/users/me
 * @access    Private (Any authenticated user)
 */
const deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  sendNoContent(res);
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMe,
  deleteMe
};
