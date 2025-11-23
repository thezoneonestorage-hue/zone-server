const express = require("express");
const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");

const router = express.Router();

// Public routes (read-only)
router.get("/", categoryController.getAllCategories);
router.get("/:slug", categoryController.getCategory);

// Protected admin routes
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router.post("/", categoryController.createCategory);
router.patch("/:slug", categoryController.updateCategory);
router.delete("/:slug", categoryController.deleteCategory);

module.exports = router;
