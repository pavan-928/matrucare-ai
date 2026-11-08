/** Operational error with an HTTP status code and optional machine-readable code. */
class AppError extends Error {
  constructor(message, statusCode = 400, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
module.exports = AppError;
