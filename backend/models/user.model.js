const { default: mongoose } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

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
});

////////////////////////////////////////
// DOCUMENT MEDDLEWARE / HOOK //////////

// runs before Model.prototype.save() and Model.create()
userSchema.pre("save", async function (next) {
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

const User = mongoose.model("User", userSchema);

module.exports = User;
