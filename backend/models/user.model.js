const { default: mongoose } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const helper = require("./../utils/helper.util");
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

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        requred: [true, "ERR: name field can't be blank"],
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
            /* [ Note : 
                Validator runs only on document creation (save/create), not for updates.
                'this' refers to the current doc for NEW docs only.
            */
            validator: function (passwordConfirm) {
                return this.password === passwordConfirm;
            },
            message:
                "ERR: password & passwordConfirm filed value should be same",
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
    createdAt: { type: Date, default: Date.now, immutable: true },
    expireAt: { type: Date },
});

// Create TTL index - this tells MongoDB to auto-delete documents
// expireAfterSeconds: 2 means delete document 2 senconds after expiredAt
userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 2 });

////////////////////////////////////////
// DOCUMENT MEDDLEWARE / HOOK //////////

// runs before Model.prototype.save() and Model.create()
userSchema.pre("save", function () {
    // Set expireAt for new unverified users
    if (this.isNew && !this.isVerified) {
        this.expireAt = helper.expiresAt(UNVERIFIED_USER_EXPIRES_IN);
    }

    // Remove expireAt when user gets verified
    if (this.isModified("isVerified") && this.isVerified) {
        this.expireAt = undefined;
    }
});

userSchema.pre("save", async function () {
    // Only run the Function if the password has been changes
    // For Ex. ( if user is changing the email, no need to hash the password in that case)
    if (!this.isModified("password")) return;

    // Hash password
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
});

// runs after Model.prototype.save() and Model.create()
userSchema.post("save", function (doc, next) {
    doc.password = undefined;
    doc.emailOtpExpires = undefined;
    doc.emailOtp = undefined;
    doc.__v = undefined;
    next();
});

////////////////////////////////////////
// Instance Method /////////////////////
// These Methods will be availabe for all the Documents

userSchema.methods.verifyPassword = async function (rawPass, hashedPass) {
    return await bcrypt.compare(rawPass, hashedPass);
};

userSchema.methods.verifyToken = async function (rawToken, hashedToken) {
    return await bcrypt.compare(rawToken, hashedToken);
};

userSchema.methods.createPasswordResetToken = function () {
    const fourDigitNum = helper.getRandomNum(1000, 9999);
    const fourAlphaStr = helper.getRandomAlphabets(4);
    const token = `${fourDigitNum}-${fourAlphaStr}`;
    return token;
};

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
