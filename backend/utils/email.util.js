const dotenv = require("dotenv");
dotenv.config({ path: "./../config.env" });

const nodemailer = require("nodemailer");

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
    await transporter.sendMail(mailOPtions);
};

function createOtpMessage(userName, otp) {
    return `Dear ${userName || "User"},\n\nWelcome to Paper Pilot!\n\nWe received a request to verify your email address. Use the One-Time Password (OTP) below to complete your registration:\nOTP: ${otp}\nThis code is valid for the next 30 minutes.\nIf you did not request this, you can safely ignore this email.\n\nThanks,\nThe Paper Pilot Team`;
}

module.exports = { sendEmail, createOtpMessage };
