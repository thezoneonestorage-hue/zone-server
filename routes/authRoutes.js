const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Public routes
router.post("/login", authController.login);
router.post("/get-security-question", authController.getSecurityQuestion);
router.post("/verify-security-answer", authController.verifySecurityQuestion);
router.post(
  "/reset-password-with-security",
  authController.resetPasswordWithSecurity
);
router.post("/verify-token", authController.verifyToken);

// Protect all routes after this middleware
router.use(authController.protect);

// Protected routes
router.get("/me", authController.getCurrentUser);
router.patch("/updatePassword", authController.updatePassword);
router.post("/logout", authController.logout);

// Security question routes
router.post("/set-security-question", authController.setSecurityQuestion);

module.exports = router;
