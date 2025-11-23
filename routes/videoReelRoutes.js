const express = require("express");
const videoReelController = require("../controllers/videoReelController");
const authController = require("../controllers/authController");

const router = express.Router();

// Public routes
router.get("/", videoReelController.getAllVideoReels);
router.get("/:id", videoReelController.getVideoReel);

// Protected routes
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router.post("/", videoReelController.createVideoReel);
router.patch("/:id", videoReelController.updateVideoReel);
router.delete("/:id", videoReelController.deleteVideoReel);

module.exports = router;
