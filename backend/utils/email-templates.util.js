exports.createOtpMessage = function (userName, otp) {
    return `Dear ${userName || "User"},\n\nWelcome to Paper Pilot!\n\nWe received a request to verify your email address. Use the One-Time Password (OTP) below to complete your registration:\nOTP: ${otp.split("").join(" ")}\nThis OTP is valid for the next 5 minutes.\nNote: Unverified accounts are automatically deleted 30 minutes after signup.\n\nIf you did not request this, you can safely ignore this email.\n\nThanks,\nThe Paper Pilot Team`;
};

module.createPassResetMessage = function (user, passwordResetURL) {
    return `Dear ${user.name},\n\nWe received a request to reset your password.\nIf this was you, please follow the instructions below:\n\nSubmit a - PATCH - request to the following URL:\n"${passwordResetURL}"\n\nRequest Body: \n{\n  "password": "<new-password>",\n  "passwordConfirm": "<new-password>",\n  "email": "${user.email}"\n}\n\nNote: This link will be valid for next 10 minutes\nIf you did not request a password reset, you can safely ignore this email.\n\nThanks,\nThe Paper Pilot Team`;
};
