/**
 * responseFormatter — Centralised HTTP response helper functions.
 *
 * WHY THIS EXISTS:
 * Without a standard formatter, every controller writes its own JSON shape.
 * Over 25 endpoints, inconsistencies creep in:
 *   - Some return { status: 'success', data: ... }
 *   - Some return { success: true, result: ... }
 *   - Some return { ok: 1, payload: ... }
 *
 * A single formatter guarantees every response in the entire API follows
 * the same envelope contract that frontend clients can rely on.
 *
 * STANDARD RESPONSE ENVELOPE:
 * {
 *   "status": "success" | "fail" | "error",
 *   "results": <number> (optional, only for list responses),
 *   "pagination": { ... } (optional, added in PR-12),
 *   "data": { ... } | null
 * }
 */

/**
 * Send a 200 OK success response with optional data payload.
 * @param {object} res       - Express response object
 * @param {object} data      - Data payload to include in response body
 * @param {string} [message] - Optional human-readable status message
 * @param {number} [statusCode=200] - HTTP status code
 */
const sendSuccess = (res, data = {}, message = null, statusCode = 200) => {
  const payload = {
    status: 'success'
  };

  if (message) payload.message = message;

  // Attach results count if the data contains an array
  const firstValue = Object.values(data)[0];
  if (Array.isArray(firstValue)) {
    payload.results = firstValue.length;
  }

  payload.data = data;

  return res.status(statusCode).json(payload);
};

/**
 * Send a 201 Created response for newly created resources.
 * @param {object} res  - Express response object
 * @param {object} data - Newly created resource data
 */
const sendCreated = (res, data = {}) => {
  return res.status(201).json({
    status: 'success',
    data
  });
};

/**
 * Send a 204 No Content response (used after successful DELETE).
 * @param {object} res - Express response object
 */
const sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Send a paginated list response with full pagination metadata.
 * @param {object} res         - Express response object
 * @param {Array}  docs        - Array of result documents
 * @param {number} total       - Total number of matching documents in DB
 * @param {number} page        - Current page number
 * @param {number} limit       - Documents per page
 * @param {string} resourceKey - The key name for the data array (e.g. "earthquakes")
 */
const sendPaginated = (res, docs, total, page, limit, resourceKey = 'data') => {
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    status: 'success',
    results: docs.length,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    data: {
      [resourceKey]: docs
    }
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendPaginated
};
