const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const {
    expiresAt,
    getRandomNum,
    getRandomAlphabets,
} = require("./../utils/helper.util");
const { UNVERIFIED_USER_EXPIRES_IN } = require("../configs/constants.config");

const validatePassword = function (password) {
    return (
        password.length >= 5 &&
        password.length <= 20 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
};

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "ERR: name field can't be blank"],
        },
        email: {
            type: String,
            required: [true, "ERR: email field can't be blank"],
            unique: true,
            lowercase: true,
            validate: {
                validator: validator.isEmail,
                message: "ERR: invalid email id",
            },
        },
        photo: String,
        password: {
            type: String,
            required: [true, "ERR: password field can't be blank"],
            select: false,
            validate: {
                validator: validatePassword,
                message:
                    "ERR: password must be 5 chars minimum and includes uppercase, lowercase, number and special-char",
            },
        },
        passwordConfirm: {
            type: String,
            required: [true, "ERR: confirm-password field can't be blank"],
            validate: {
                /*
	                Note:
	                This is a cross-field custom validator that compares password
	                and passwordConfirm. It works only during document save/create
	                because it relies on `this` being the mongoose document.
	                It will NOT work in update queries (findOneAndUpdate, updateOne, etc)
	                since `this` is not the document there.
                */
                validator: function (passwordConfirm) {
                    return this.password === passwordConfirm;
                },
                message:
                    "ERR: password & passwordConfirm field value should be same",
            },
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        emailOtp: String,
        emailOtpExpires: Date,
        passwordResetToken: String,
        passwordResetTokenExpires: Date,
        passwordChangedAt: Date,
        expireAt: { type: Date },
    },
    {
        timestamps: true,
    },
);

/*
    @description TTL index to automatically delete expired users
    MongoDB removes documents once expireAt is reached.
    expireAfterSeconds adds a small buffer before deletion.
*/

userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 2 });

////////////////////////////////////////
// DOCUMENT MIDDLEWARE / HOOK //////////

/*
    @description Handle verification expiry logic
    - Sets expireAt for new unverified users
    - Removes expireAt once user becomes verified
*/

userSchema.pre("save", function () {
    if (this.isNew && !this.isVerified) {
        this.expireAt = expiresAt(UNVERIFIED_USER_EXPIRES_IN);
    }

    if (this.isModified("isVerified") && this.isVerified) {
        this.expireAt = undefined;
    }
});

/*
    @description Hash password and update passwordChangedAt timestamp
*/

userSchema.pre("save", async function () {
    // Only run the Function if the password has been changed
    // For Ex. ( if user is changing the email, no need to hash the password in that case)
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    if (!this.isNew) {
        this.passwordChangedAt = new Date();
    }
});

/*
    @description Hash email OTP before persisting
*/

userSchema.pre("save", async function () {
    if (!this.isModified("emailOtp") || !this.emailOtp) return;
    this.emailOtp = await bcrypt.hash(this.emailOtp, 12);
});

/*
    @description Hash password reset token before persisting
*/

userSchema.pre("save", async function () {
    if (!this.isModified("passwordResetToken") || !this.passwordResetToken)
        return;

    this.passwordResetToken = await bcrypt.hash(this.passwordResetToken, 12);
});

/*
    @description Remove sensitive fields from document after save
*/

userSchema.post("save", function (doc, next) {
    doc.password = undefined;
    doc.emailOtpExpires = undefined;
    doc.emailOtp = undefined;
    doc.__v = undefined;
    next();
});

////////////////////////////////////////
// Instance Method /////////////////////
// These Methods will be available for all the Model instances (i.e documents)
// (called like: document.methodName())

/*
    @description Verify bcrypt hash
    @param       {String} rawVal - The raw password value
    @param       {String} hashedVal - The hashed password value
    @returns     {Promise<Boolean>} - A promise that resolves to true if password is valid, false otherwise
*/

const bcryptVerification = async function (rawVal, hashedVal) {
    return await bcrypt.compare(rawVal, hashedVal);
};

userSchema.methods.verifyPassword = bcryptVerification;
userSchema.methods.verifyEmailOtp = bcryptVerification;
userSchema.methods.verifyPasswordResetToken = bcryptVerification;

/*
    @description Create a password reset token
    @returns     {String} - The password reset token
*/

userSchema.methods.createPasswordResetToken = function () {
    const fourDigitNum = getRandomNum(1000, 9999);
    const fourAlphaStr = getRandomAlphabets(4);
    const token = `${fourDigitNum}-${fourAlphaStr}`;
    return token;
};

/*
    @description Check if password was changed after token was issued
    @param       {Number} JWTTimestamp - The timestamp of the JWT token
    @returns     {Boolean} - True if password was changed after token was issued, false otherwise
*/

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10,
        );
        return JWTTimestamp < changedTimeStamp;
    }
    return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
