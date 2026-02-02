const nodemailer = require("nodemailer");
const { ClientError } = require("./error.service");

const gmOptions = {
    service: "gmail",
    auth: {
        user: "aj19990321@gmail.com",
        pass: `16-Char-App-Password`,
    },
};

// Dev Test Emails
const mailPitOptions = {
    host: "localhost",
    port: 1025,
};

// [1] Transporter
const transporter = nodemailer.createTransport(mailPitOptions);

exports.sendEmail = async function (options) {
    // [2] Define the Email Options
    const mailOPtions = {
        from: { name: "Paper Pilot", address: "noreply@paperpilot.ai" },
        to: options.to,
        subject: options.subject,
        text: options.message,
    };

    // [3] Send the Email
    try {
        await transporter.sendMail(mailOPtions);
    } catch (error) {
        throw new ClientError("There was an error in Sending Email", 500);
    }
};
