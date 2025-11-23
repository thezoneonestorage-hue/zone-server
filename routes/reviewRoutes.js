const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router();

// Public routes
router.get("/", reviewController.getAllReviews);
router.get("/videos", reviewController.getVideoReviews); // Get reviews with videos
router.get("/text", reviewController.getTextReviews); // Get text-only reviews

// Protected routes
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router.post("/", reviewController.createReview);
router.patch("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
