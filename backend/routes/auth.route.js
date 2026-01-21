const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

// User Signup Route
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/verify-email").post(authController.verifyEmail);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/reset-password/:token").patch(authController.resetPassword);

module.exports = router;
