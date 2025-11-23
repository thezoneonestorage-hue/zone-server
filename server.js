const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Load environment variables
dotenv.config({ path: "./.env" });

// Database connection
const connectDB = require("./config/db");
connectDB();

// Route imports
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const videoReelRoutes = require("./routes/videoReelRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const contactRoutes = require("./routes/contactRoutes");
const faqRoutes = require("./routes/faqRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");

// Add this line with your other routes

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(cookieParser()); // Cookie parser

// Enhanced CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL, // Primary frontend URL
  process.env.FRONTEND_URL.replace(/\/$/, ""), // Without trailing slash
  process.env.FRONTEND_URL + "/", // With trailing slash
  "http://localhost:5173", // Local development
  "http://localhost:5173/", // Local development with slash
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list
    if (
      allowedOrigins.some((allowedOrigin) => {
        return (
          origin === allowedOrigin ||
          origin.replace(/\/$/, "") === allowedOrigin.replace(/\/$/, "")
        );
      })
    ) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/video-reels", videoReelRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/faqs", faqRoutes);
app.use("/api/v1/statistics", statisticsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Error handling middleware
const errorHandler = require("./middleware/error");
app.use(errorHandler);

//  configuration
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`);
  console.error("Unhandled Rejection at:", promise);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  console.error("Uncaught Exception thrown:", err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
