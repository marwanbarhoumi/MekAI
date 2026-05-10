const errorHandler = (err, req, res, next) => {
  console.error('❌', err.message);

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Erreur serveur interne.',
  });
};

module.exports = errorHandler;