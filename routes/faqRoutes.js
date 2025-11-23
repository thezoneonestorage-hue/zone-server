const express = require("express");
const faqController = require("../controllers/faqController");
const authController = require("../controllers/authController");

const router = express.Router();

// Public routes
router.get("/", faqController.getAllFAQs);
router.get("/popular", faqController.getPopularFAQs);
router.get("/category/:category", faqController.getFAQsByCategory);
router.get("/:slug", faqController.getFAQ);
router.post("/:slug/helpful", faqController.markHelpful);
router.post("/:slug/not-helpful", faqController.markNotHelpful);

// Protected admin routes
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router.post("/", faqController.createFAQ);
router.patch("/:slug", faqController.updateFAQ);
router.delete("/:slug", faqController.deleteFAQ);

module.exports = router;
