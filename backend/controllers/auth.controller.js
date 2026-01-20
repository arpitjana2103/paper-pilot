const jwt = require("jsonwebtoken");

const helper = require("./../utils/helper.util");
const { catchAsyncErrors, AppError } = require("./error.controller");
const User = require("./../models/user.model");
const { sendEmail, createOtpMessage } = require("./../utils/email.util");

const signToken = function (payload) {
    const jwtSecreatKey = process.env.JWT_SECRET;
    const jwtExpiresIn = {
        expiresIn: process.env.JWT_EXPIRES_IN,
    };
    const token = jwt.sign(payload, jwtSecreatKey, jwtExpiresIn);
    return token;
};

const signAndSendToken = function (user, statusCode, res) {
    const token = signToken({ _id: user._id });
    const cookieExpiresIn = helper.toMs(process.env.JWT_COOKIE_EXPIRES_IN);

    const cookieOptions = {
        expires: new Date(Date.now() + cookieExpiresIn),
        secure: false,
        httpOnly: true,
    };
    if (helper.runningOnProd()) cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);

    return res.status(statusCode).json({
        status: "success",
        token: token,
        data: {
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
            },
        },
    });
};

// @desc    User Signup
// @route   POST /api/v1/auth/signup
// @access  Public

exports.signup = catchAsyncErrors(async function (req, res, next) {
    // [1] Check if user with the email already exists
    const existingUser = await User.findOne({ email: req.body.email });

    // verified existing user
    if (existingUser && existingUser.isVerified) {
        return res.status(400).json({
            status: "fail",
            message: "User with this email already exists",
        });
    }

    // not verified existing user - delete the old unverified user
    if (existingUser && !existingUser.isVerified) {
        await existingUser.deleteOne();
    }

    // [2] Generate 6-digit OTP
    const otp = helper.getRandomAlphabets(6);
    const otpExpires = Date.now() + helper.toMs("30m"); // 10 minutes

    // [3] Create User
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        isVerified: false,
        emailOtp: otp,
        emailOtpExpires: otpExpires,
    });

    // [4] Send OTP email
    const message = createOtpMessage(user.name, otp);

    await sendEmail({
        to: user.email,
        subject: "Verify your Paper Pilot account",
        message: message,
    });

    return res.status(201).json({
        status: "success",
        message:
            "User created. OTP sent to email. Please verify to complete registration.",
        data: { email: user.email },
    });
});

// @desc    Verify Email OTP
// @route   POST /api/v1/auth/verify-email
// @access  Public

exports.verifyEmail = catchAsyncErrors(async function (req, res, next) {
    // [1] Validate input
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res
            .status(400)
            .json({ status: "fail", message: "Email and otp are required" });
    }

    // [2] Find user
    const user = await User.findOne({ email });

    if (!user)
        return res
            .status(400)
            .json({ status: "fail", message: "No user found with this email" });

    // [3] Verify OTP
    if (user.isVerified)
        return res
            .status(400)
            .json({ status: "fail", message: "User already verified" });

    if (
        !user.emailOtp ||
        !user.emailOtpExpires ||
        user.emailOtpExpires < Date.now()
    ) {
        return res.status(400).json({
            status: "fail",
            message: "OTP expired or not found. Please request a new OTP.",
        });
    }

    if (user.emailOtp !== otp) {
        return res.status(400).json({ status: "fail", message: "Invalid OTP" });
    }

    // [4] Update User
    user.isVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // [5] Sign and send token
    signAndSendToken(user, 200, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public

exports.login = catchAsyncErrors(async function (req, res, next) {
    // [1] Validate Input
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError("Please provide email and password!", 400));
    }

    // [2] Check if User exists and Passwrod is correct
    const user = await User.findOne({ email: email }).select("+password");

    // [3] Check if User is verified
    if (user && !user.isVerified) {
        await user.deleteOne();
        return next(new AppError("User not exist", 401));
    }

    // [4] Check if User exist and password is correct
    if (!user || !(await user.verifyPassword(password, user.password))) {
        return next(new AppError("Incorrect Email or Password", 401));
    }

    // [5] If everything ok, send Token to client
    signAndSendToken(user, 200, res);
});
