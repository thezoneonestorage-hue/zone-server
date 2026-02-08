const express = require("express");
const aboutController = require("../controllers/aboutController");
const authController = require("../controllers/authController");

const router = express.Router();

// Public routes
router.get("/", aboutController.getAboutPage);
router.get("/team-members", aboutController.getTeamMembers);
router.get("/achievements", aboutController.getAchievements);
router.get("/brand-logos", aboutController.getBrandLogos);
router.get("/agency-info", aboutController.getAgencyInfo);

// Protected routes (Admin only)
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

// Get all about pages (admin)
router.get("/admin", aboutController.getAllAboutPages);

// Create new about page
router.post("/admin", aboutController.createAboutPage);

// Get specific about page by ID
router.get("/admin/:id", aboutController.getAboutPageWithDetails);

// Update about page
router.patch("/admin/:id", aboutController.updateAboutPage);

// Delete about page
router.delete("/admin/:id", aboutController.deleteAboutPage);

// Team Member Management
router.post("/admin/:id/team-members", aboutController.addTeamMember);
router.patch(
  "/admin/:id/team-members/:teamMemberId",
  aboutController.updateTeamMember
);
router.delete(
  "/admin/:id/team-members/:teamMemberId",
  aboutController.deleteTeamMember
);

// Achievement Management
router.post("/admin/:id/achievements", aboutController.addAchievement);
router.patch(
  "/admin/:id/achievements/:achievementId",
  aboutController.updateAchievement
);
router.delete(
  "/admin/:id/achievements/:achievementId",
  aboutController.deleteAchievement
);

// Brand Logo Management
router.post("/admin/:id/brand-logos", aboutController.addBrandLogo);
router.patch(
  "/admin/:id/brand-logos/:brandLogoId",
  aboutController.updateBrandLogo
);
router.delete(
  "/admin/:id/brand-logos/:brandLogoId",
  aboutController.deleteBrandLogo
);

// Order management
router.post("/admin/:id/order/:type", aboutController.updateOrder);

// Toggle active status
router.patch(
  "/admin/:id/:type/:itemId/toggle",
  aboutController.toggleActiveStatus
);

// Duplicate about page
router.post("/admin/:id/duplicate", aboutController.duplicateAboutPage);

// Export about page
router.get("/admin/:id/export", aboutController.exportAboutPage);

// Import about page
router.post("/admin/import", aboutController.importAboutPage);

module.exports = router;
