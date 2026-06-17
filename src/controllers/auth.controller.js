const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseFormatter');

// Helper to sign JWT tokens
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_signing_key_change_me_in_production', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Helper to format and send JWT token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || res.req.secure || res.req.headers['x-forwarded-proto'] === 'https'
  };

  res.cookie('jwt', token, cookieOptions);

  // Hide password in output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

/**
 * @desc      Register a new user
 * @route     POST /api/v1/auth/register
 * @access    Public
 */
const register = asyncHandler(async (req, res, next) => {
  // Prevent admin role assignment during registration
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: 'user' // Default to standard user
  });

  createSendToken(newUser, 201, res);
});

/**
 * @desc      Log in user
 * @route     POST /api/v1/auth/login
 * @access    Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  // 2) Check if user exists & password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

/**
 * @desc      Log out user
 * @route     POST /api/v1/auth/logout
 * @access    Public
 */
const logout = asyncHandler(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.'
  });
});

/**
 * @desc      Get logged-in user profile
 * @route     GET /api/v1/auth/profile
 * @access    Private (Protected)
 */
const getProfile = asyncHandler(async (req, res, next) => {
  sendSuccess(res, { user: req.user });
});

/**
 * @desc      Update logged-in user profile
 * @route     PATCH /api/v1/auth/profile
 * @access    Private (Protected)
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  // Filter out fields that are not allowed to be updated directly
  const filteredBody = {};
  if (req.body.name) filteredBody.name = req.body.name;
  if (req.body.email) filteredBody.email = req.body.email;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  sendSuccess(res, { user: updatedUser }, 'Profile updated successfully.');
});

/**
 * @desc      Change password for logged-in user
 * @route     POST /api/v1/auth/change-password
 * @access    Private (Protected)
 */
const changePassword = asyncHandler(async (req, res, next) => {
  // 1) Get user from database with password
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  // 3) Update password
  user.password = req.body.newPassword;
  await user.save();

  // 4) Log user in with new token
  createSendToken(user, 200, res);
});

/**
 * @desc      Request password reset token
 * @route     POST /api/v1/auth/forgot-password
 * @access    Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Create reset URL
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

  // Mock Email Dispatch (log to console in dev/test)
  console.log(`\n📧 [MOCK EMAIL] Password Reset requested for ${user.email}`);
  console.log(`🔗 Reset URL: ${resetURL}\n`);

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email (simulated).',
    resetURL // Exposing resetURL directly to make API manual testing easy
  });
});

/**
 * @desc      Reset user password using reset token
 * @route     POST /api/v1/auth/reset-password/:token
 * @access    Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Log the user in, send JWT
  createSendToken(user, 200, res);
});

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
