const express = require("express");
const serviceController = require("../controllers/serviceController");
const authController = require("../controllers/authController");

const router = express.Router();

// Public routes
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getService);

// Protected routes (admin only for write operations)
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

// Only admins can create, update, delete services
router.post("/", serviceController.createService);
router.patch("/:id", serviceController.updateService);
router.delete("/:id", serviceController.deleteService);

module.exports = router;
