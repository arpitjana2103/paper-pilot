const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();
const {
    uploadProfile,
    cleanupFileOnError,
} = require("../configs/multer.config");
const { PROFILE_PHOTO_FIELDNAME } = require("../configs/constants.config");

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/verify-email").post(authController.verifyEmail);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/reset-password/:token").patch(authController.resetPassword);
router.route("/resend-otp").post(authController.resendOTP);

// Protected Routes
router.use(authController.authProtect);

router.route("/update-password").patch(authController.updatePassword);
router
    .route("/update-profile")
    .patch(
        uploadProfile.single(PROFILE_PHOTO_FIELDNAME),
        authController.updateProfile,
        cleanupFileOnError,
    );

module.exports = router;
