function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Error interno del servidor' : err.message;
  if (status === 500) console.error(err);
  return res.status(status).json({ error: message });
}

module.exports = errorHandler;
