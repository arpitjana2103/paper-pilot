const { default: mongoose } = require("mongoose");

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
});

const User = mongoose.model("User", userSchema);

module.exports = User;
