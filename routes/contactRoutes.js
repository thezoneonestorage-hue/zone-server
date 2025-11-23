const express = require("express");
const contactController = require("../controllers/contactController");
const authController = require("../controllers/authController");

const router = express.Router();

// Public routes - always return success with empty data if no contact found
router.get("/", contactController.getContactInfo);
router.get("/public", contactController.getPublicContactInfo); // Always returns structure

// Protected admin routes
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router
  .route("/")
  .post(contactController.createOrUpdateContact)
  .patch(contactController.updateContact)
  .delete(contactController.deleteContact);

router.get("/all", contactController.getAllContactEntries);

module.exports = router;
