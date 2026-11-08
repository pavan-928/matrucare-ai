const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let code = typeof err.code === 'string' ? err.code : undefined;

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = 'A record with these details already exists';
    code = undefined;
  } else if (err.message === 'Not allowed by CORS') {
    status = 403;
  }

  if (status >= 500) {
    console.error(err);
    message = 'Something went wrong on our side. Please try again.';
  }

  res.status(status).json({ message, ...(code ? { code } : {}) });
};

module.exports = { notFound, errorHandler };
