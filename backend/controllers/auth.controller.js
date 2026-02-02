const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const {
    expiresAt,
    runningOnProd,
    getRandomAlphabets,
} = require("./../utils/helper.util");
const { catchAsyncErrors, ClientError } = require("./error.controller");
const User = require("./../models/user.model");
const {
    JWT,
    OTP,
    HTTP,
    UNVERIFIED_USER_EXPIRES_IN,
    PASSWORD_RESET_TOKEN_EXPIRES_IN,
    UPLOAD_BASE_URL,
} = require("./../configs/constants.config");

const { sendEmail } = require("./../services/email.service");

const {
    createOtpMessage,
    createPassResetMessage,
} = require("./../utils/email-templates.util");

const signToken = function (payload) {
    const jwtSecreatKey = JWT.SECRET;
    const jwtExpiresIn = {
        expiresIn: JWT.EXPIRES_IN,
    };
    const token = jwt.sign(payload, jwtSecreatKey, jwtExpiresIn);
    return token;
};

const signAndSendToken = function (user, statusCode, req, res) {
    const token = signToken({ _id: user._id });

    const cookieOptions = {
        expires: expiresAt(JWT.COOKIE_EXPIRES_IN),
        secure: false,
        httpOnly: true,
    };
    if (runningOnProd()) cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);

    return res.status(statusCode).json({
        status: "success",
        token: token,
        data: {
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                photo:
                    user.photo && `${UPLOAD_BASE_URL}/profiles/${user.photo}`,
            },
        },
    });
};

/*
    @desc    User Signup
    @route   POST /api/v1/auth/signup
    @access  Public
*/

exports.signup = catchAsyncErrors(async function (req, res, next) {
    // [1] Check if user exists
    const existingUser = await User.findOne({ email: req.body.email });

    // [2] Verified user already exists
    if (existingUser && existingUser.isVerified) {
        return res.status(HTTP.BAD_REQUEST).json({
            status: "fail",
            message: "User with this email already exists",
        });
    }

    // [3] Generate OTP
    const otp = getRandomAlphabets(OTP.LENGTH);

    let user;

    // [4] Update existing unverified user
    if (existingUser && !existingUser.isVerified) {
        existingUser.name = req.body.name;
        existingUser.password = req.body.password;
        existingUser.passwordConfirm = req.body.passwordConfirm;
        existingUser.emailOtp = otp;
        existingUser.emailOtpExpires = expiresAt(OTP.EXPIRES_IN);
        existingUser.expireAt = expiresAt(UNVERIFIED_USER_EXPIRES_IN);

        user = await existingUser.save({ validateBeforeSave: true });
    }

    // [5] Create new user
    if (!existingUser) {
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            isVerified: false,
            emailOtp: otp,
            emailOtpExpires: expiresAt(OTP.EXPIRES_IN),
        });
    }

    // [6] Send OTP email
    await sendEmail({
        to: user.email,
        subject: "Verify your Paper Pilot account",
        message: createOtpMessage(user.name, otp),
    });

    return res.status(existingUser ? HTTP.OK : HTTP.CREATED).json({
        status: "success",
        message: "OTP sent to email. Please verify to complete registration.",
        data: { email: user.email },
    });
});

/*
    @desc    resendOTP
    @route   POST /api/v1/auth/resend-otp
    @access  Public
*/

exports.resendOTP = catchAsyncErrors(async function (req, res, next) {
    // [1] Check if user exists
    const existingUser = await User.findOne({ email: req.body.email });

    if (!existingUser) {
        return res.status(HTTP.BAD_REQUEST).json({
            status: "fail",
            message: "No user found with this email",
        });
    }

    // [2] Verified user already exists
    if (existingUser && existingUser.isVerified) {
        return res.status(HTTP.BAD_REQUEST).json({
            status: "fail",
            message: "User with this email already verified",
        });
    }

    // [3] Generate OTP
    const otp = getRandomAlphabets(OTP.LENGTH);

    // [4] Update User
    existingUser.emailOtp = otp;
    existingUser.emailOtpExpires = expiresAt(OTP.EXPIRES_IN);
    await existingUser.save({ validateBeforeSave: false });

    // [5] Send OTP email
    await sendEmail({
        to: existingUser.email,
        subject: "Verify your Paper Pilot account",
        message: createOtpMessage(existingUser.name, otp),
    });

    return res.status(HTTP.OK).json({
        status: "success",
        message: "OTP sent to email. Please verify to complete registration.",
        data: { email: existingUser.email },
    });
});

/*
    @desc    Verify Email
    @route   POST /api/v1/auth/verify-email
    @access  Public
*/

exports.verifyEmail = catchAsyncErrors(async function (req, res, next) {
    // [1] Validate input
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res
            .status(HTTP.BAD_REQUEST)
            .json({ status: "fail", message: "Email and otp are required" });
    }

    // [2] Find user
    const user = await User.findOne({ email });

    if (!user)
        return res
            .status(HTTP.BAD_REQUEST)
            .json({ status: "fail", message: "No user found with this email" });

    // [3] Verify OTP
    if (user.isVerified)
        return res
            .status(HTTP.BAD_REQUEST)
            .json({ status: "fail", message: "User already verified" });

    if (
        !user.emailOtp ||
        !user.emailOtpExpires ||
        user.emailOtpExpires < Date.now()
    ) {
        return res.status(HTTP.BAD_REQUEST).json({
            status: "fail",
            message: "OTP expired or not found. Please request a new OTP.",
        });
    }

    if (!(await user.verifyEmailOtp(otp, user.emailOtp))) {
        return res
            .status(HTTP.BAD_REQUEST)
            .json({ status: "fail", message: "Invalid OTP" });
    }

    // [4] Update User
    user.isVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // [5] Sign and send token
    signAndSendToken(user, HTTP.OK, req, res);
});

/*
    @desc    Login user
    @route   POST /api/v1/auth/login
    @access  Public
*/

exports.login = catchAsyncErrors(async function (req, res, next) {
    // [1] Validate Input
    const { email, password } = req.body;
    if (!email || !password) {
        return next(
            new ClientError(
                "Please provide email and password!",
                HTTP.BAD_REQUEST,
            ),
        );
    }

    // [2] Check if User exists and Passwrod is correct
    const user = await User.findOne({ email: email }).select("+password");

    // [3] Check if User is verified
    if (user && !user.isVerified) {
        return next(new ClientError("User not verified!", HTTP.BAD_REQUEST));
    }

    // [4] Check if User exist and password is correct
    if (!user || !(await user.verifyPassword(password, user.password))) {
        return next(
            new ClientError("Incorrect Email or Password", HTTP.UNAUTHORIZED),
        );
    }

    // [5] If everything ok, send Token to client
    signAndSendToken(user, HTTP.OK, req, res);
});

/*
    @desc    Forgot Password
    @route   POST /api/v1/auth/forgot-passowrd
    @access  Public
*/

exports.forgotPassword = catchAsyncErrors(async function (req, res, next) {
    // [1] Get user based on POSTed Email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ClientError("No user found!", HTTP.NOT_FOUND));
    }

    // [2] Check if User is verified
    if (user && !user.isVerified) {
        return next(new ClientError("User not verified!", HTTP.BAD_REQUEST));
    }

    // [3] Generate Random Reset Token
    const resetToken = user.createPasswordResetToken();

    // [4] Update User
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = expiresAt(PASSWORD_RESET_TOKEN_EXPIRES_IN);
    await user.save({ validateBeforeSave: false });

    // [5] Send Token to User-Email
    const baseURL = `${req.protocol}://${req.get("host")}`;
    const passwordResetURL = `${baseURL}/api/v1/auth/reset-password/${resetToken}`;

    try {
        await sendEmail({
            to: user.email,
            subject: "PaperPilot : Reset Password Instructions",
            message: createPassResetMessage(user, passwordResetURL),
        });

        return res.status(HTTP.OK).json({
            status: "success",
            message:
                "Password reset instructions have been sent to your registered email-address.",
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });
        next(error);
    }
});

/*
    @desc    Reset Password
    @route   POST /api/v1/auth/reset-passowrd
    @access  Public
*/

exports.resetPassword = catchAsyncErrors(async function (req, res, next) {
    // [1] Get User base on Email
    const { email } = req.body;
    const user = await User.findOne({
        email: email,
    });
    if (!user) {
        return next(
            new ClientError("No user found with the email-address provided."),
        );
    }

    // [3] Check if Token Invalid
    const rawToken = req.params.token;
    const hashedToken = user.passwordResetToken || "";
    const isTokenInvalid = !(await user.verifyPasswordResetToken(
        rawToken,
        hashedToken,
    ));
    if (isTokenInvalid) {
        return next(
            new ClientError("Invalid Password-Reset-Link!", HTTP.BAD_REQUEST),
        );
    }

    // [4] Check if Token Expired
    /* Exmple : 
       let say user forgetPassword at 8.00
       then passwordResetLink is valid upto 8.10
       if Date.now() is 8.15 then user is not allowed to reset password with that link */

    const resetTokenExpiredAt = user.passwordResetTokenExpires.getTime();
    if (Date.now() > resetTokenExpiredAt) {
        return next(
            new ClientError("Password-Reset-Link expired!", HTTP.BAD_REQUEST),
        );
    }

    // [2] Set new password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    // [3] Log the user in, send JWT
    signAndSendToken(user, HTTP.OK, req, res);
});

/*
    @desc    Update Password
    @route   POST /api/v1/auth/update-passowrd
    @access  Privet
*/

exports.updatePassword = catchAsyncErrors(async function (req, res, next) {
    // [1] Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // [2] Check if POSTed passowrd is correct
    if (!(await user.verifyPassword(req.body.passwordCurrent, user.password))) {
        return next(
            new ClientError(
                "Your current password is wrong.",
                HTTP.UNAUTHORIZED,
            ),
        );
    }

    // [3] Update the Password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // [4] Log in User and send JWT
    signAndSendToken(user, HTTP.OK, req, res);
});

/*
    @desc    Update Profile
    @route   PATCH /api/v1/auth/update-profile
    @access  Privet
*/

exports.updateProfile = catchAsyncErrors(async function (req, res, next) {
    // [1] Get user from collection
    const user = await User.findById(req.user.id);

    // [2] Update the Profile
    user.name = req.body.name || user.name;
    user.photo = req.file?.filename || user.filename;
    await user.save({ validateBeforeSave: false });

    // [3] Send Response
    return res.status(HTTP.OK).json({
        status: "success",
        message: "Profile updated successfully.",
        data: {
            user: {
                name: user.name,
                photo:
                    user.photo && `${UPLOAD_BASE_URL}/profiles/${user.photo}`,
            },
        },
    });
});

/*
    [MIDDLEWARE]
    @desc    Auth Protect Middleware
    @access  Privet
*/

exports.authProtect = catchAsyncErrors(async function (req, res, next) {
    // [1] Getting the Token
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer")) {
        token = token.split(" ")[1];
    } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new ClientError("Please login to get access.", HTTP.UNAUTHORIZED),
        );
    }

    // [2] Verify token
    const decoded = await promisify(jwt.verify)(token, JWT.SECRET);

    // [3] Check if user still exists
    /* Ex. What if user has been deleated in the mean-time and someone-else is
       is trying to access stealing the token */
    const user = await User.findById(decoded._id);
    if (!user) {
        return next(
            new ClientError("The User donot exist.", HTTP.UNAUTHORIZED),
        );
    }

    // [4] Check if user changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
        return next(
            new ClientError(
                "Password changed! Please log in again!",
                HTTP.UNAUTHORIZED,
            ),
        );
    }

    // [5] bind user with reqObj
    req.user = user;
    next();
});
