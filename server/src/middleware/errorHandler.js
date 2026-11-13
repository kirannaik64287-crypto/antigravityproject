export const errorHandler = (err, req, res, next) => {
  console.error(`[Error ${req.method} ${req.url}]:`, err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error occurred';

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};
