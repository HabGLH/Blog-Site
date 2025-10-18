import winston from "winston";
import path from "path";

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Create logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // Log all info and above to requests.log
    new winston.transports.File({
      filename: path.join("logs", "requests.log"),
    }),

    // Log errors separately
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),

    // Optional: log to console
    new winston.transports.Console(),
  ],
});

export default logger;
