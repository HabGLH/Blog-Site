import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/authRoutes.js";
import morgan from "morgan";
import logger from "./utils/logger.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Handle malformed JSON bodies from clients gracefully
app.use((err, req, res, next) => {
  if (
    err &&
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    logger.error(
      `Malformed JSON in request | ${req.method} ${req.originalUrl} | Stack: ${err.stack}`
    );
    return res.status(400).json({ message: "Malformed JSON in request body" });
  }
  next();
});

// Custom stream
const stream = {
  write: (message) => logger.info(message.trim()),
};

// Log all HTTP requests
app.use(morgan("combined", { stream }));

app.use("/api/auth", userRoutes);
app.use("/api/posts", postRoutes);

//Starting the server section
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// 404 handler - must be after all routes
app.use((req, res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(err); // pass to error handler
});
app.use((err, req, res, next) => {
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
});
