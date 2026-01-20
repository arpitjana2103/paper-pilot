const express = require("express");
const { signup, verifyEmail } = require("../controllers/auth.controller");
const router = express.Router();

// User Signup Route
router.route("/signup").post(signup);
router.route("/verify-email").post(verifyEmail);

module.exports = router;
