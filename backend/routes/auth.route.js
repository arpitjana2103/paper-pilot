const express = require("express");
const { signup } = require("../controllers/auth.controller");
const router = express.Router();

// User Signup Route
router.route("/signup").post(signup);

module.exports = router;
