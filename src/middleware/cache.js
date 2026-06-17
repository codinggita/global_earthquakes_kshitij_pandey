/**
 * Simple in-memory cache middleware.
 *
 * Caches GET response bodies keyed by URL for a configurable TTL (seconds).
 * Attach per-route: router.get('/stats', cache(60), controller)
 *
 * @param {number} ttlSeconds - How long to cache the response (default 60s)
 */
const cache = (ttlSeconds = 60) => {
  const store = new Map();

  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const key  = req.originalUrl;
    const hit  = store.get(key);

    if (hit && Date.now() < hit.expiresAt) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(hit.body);
    }

    // Intercept res.json to capture the body
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) {
        store.set(key, {
          body:      JSON.stringify(body),
          expiresAt: Date.now() + ttlSeconds * 1000
        });
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
};

module.exports = cache;
