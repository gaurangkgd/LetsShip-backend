function errorHandler(err, req, res, next) {
  const timestamp = new Date().toISOString();
  const message = err && err.message ? err.message : String(err);
  console.error(`[${timestamp}] Error:`, message);

  const statusCode = err && err.statusCode ? err.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = errorHandler;
