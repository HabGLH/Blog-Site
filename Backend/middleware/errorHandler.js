import logger from "../utils/logger.js";

// Error handler
// 404 handler (not found)
export const notFoundError = (req, res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(err); // pass to error handler
};
// General error handler
export const generalError = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // log error
  logger.error(
    `${err.message} | ${req.method} ${req.originalUrl} | Stack: ${err.stack}`
  );

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
};
