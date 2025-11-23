const express = require("express");
const statisticsController = require("../controllers/statisticsController");
const authController = require("../controllers/authController");

const router = express.Router();

// Public routes (read-only)
router.get("/", statisticsController.getAllStatistics);
router.get("/active", statisticsController.getActiveStatistics);
router.get("/:slug", statisticsController.getStatistic);

// Protected admin routes
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router.post("/", statisticsController.createStatistic);
router.patch("/:slug", statisticsController.updateStatistic);
router.delete("/:slug", statisticsController.deleteStatistic);
router.patch("/:slug/toggle", statisticsController.toggleStatistic);

module.exports = router;
