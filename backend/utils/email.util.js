const nodemailer = require("nodemailer");
const { AppError } = require("../controllers/error.controller");

const gmOptions = {
    service: "gmail",
    auth: {
        user: "aj19990321@gmail.com",
        pass: `16-Char-App-Password`,
    },
};

const mtOptions = {
    host: `sandbox.smtp.mailtrap.io`,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
};

// [1] Transporter
const transporter = nodemailer.createTransport(mtOptions);

const sendEmail = async function (options) {
    // [2] Define the Email Options
    const mailOPtions = {
        from: { name: "Paper Pilot", address: "paperpilot.ai" },
        to: options.to,
        subject: options.subject,
        text: options.message,
    };

    // [3] Send the Email
    try {
        await transporter.sendMail(mailOPtions);
    } catch (error) {
        throw new AppError("There was an error in Sending Email", 500);
    }
};

function createOtpMessage(userName, otp) {
    return `Dear ${userName || "User"},\n\nWelcome to Paper Pilot!\n\nWe received a request to verify your email address. Use the One-Time Password (OTP) below to complete your registration:\nOTP: ${otp}\nThis code is valid for the next 30 minutes.\nIf you did not request this, you can safely ignore this email.\n\nThanks,\nThe Paper Pilot Team`;
}

function createPassResetMessage(user, passwordResetURL) {
    return `Dear ${user.name},\n\nWe received a request to reset your password.\nIf this was you, please follow the instructions below:\n\nSubmit a - PATCH - request to the following URL:\n"${passwordResetURL}"\n\nRequest Body: \n{\n  "password": "<new-password>",\n  "passwordConfirm": "<new-password>",\n  "email": "${user.email}"\n}\n\nNote: This link will be valid for next 10 minutes\nIf you did not request a password reset, you can safely ignore this email.\n\nThanks,\nThe Paper Pilot Team`;
}

module.exports = { sendEmail, createOtpMessage, createPassResetMessage };
