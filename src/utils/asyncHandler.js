/**
 * asyncHandler — Reusable higher-order wrapper for async Express route handlers.
 *
 * PROBLEM IT SOLVES:
 * Every async controller method needs a try/catch block to forward errors to
 * Express's global error handler via next(err). Without it, an unhandled
 * rejected promise inside a controller would crash the server silently.
 *
 * BEGINNER APPROACH (bad — repeated in every controller):
 *   const getEarthquakes = async (req, res, next) => {
 *     try {
 *       const data = await Earthquake.find();
 *       res.json(data);
 *     } catch (err) {
 *       next(err); // repeated in every single function
 *     }
 *   };
 *
 * PROFESSIONAL APPROACH (using asyncHandler):
 *   const getEarthquakes = asyncHandler(async (req, res, next) => {
 *     const data = await Earthquake.find();
 *     res.json(data);
 *   });
 *   // If Earthquake.find() throws, asyncHandler automatically catches it
 *   // and calls next(err) — no try/catch needed inside the controller.
 *
 * HOW IT WORKS:
 * asyncHandler returns a new function. When Express calls that function with
 * (req, res, next), it executes the original async fn and attaches .catch(next)
 * to the returned Promise. If the Promise rejects, .catch(next) forwards
 * the error to Express's error handling middleware pipeline.
 *
 * @param {Function} fn - An async Express route handler function
 * @returns {Function}  - A wrapped function with automatic error forwarding
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
