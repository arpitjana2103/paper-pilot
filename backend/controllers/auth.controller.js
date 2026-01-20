const jwt = require("jsonwebtoken");

const helper = require("./../utils/helper.util");
const { catchAsyncErrors } = require("./error.controller");
const User = require("./../models/user.model");

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
            user2: user,
        },
    });
};

// @desc    User Signup
// @route   POST /api/v1/auth/signup
// @access  Public

exports.signup = catchAsyncErrors(async function (req, res, next) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
        return res.status(400).json({
            status: "fail",
            message: "User with this email already exists",
        });
    }

    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    signAndSendToken(user, 201, res);
});
