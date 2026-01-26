const path = require("path");

module.exports = {
    // File Upload Constants
    PROFILE_PHOTO_FIELDNAME: "profile-photo",
    DOCUMENT_PDF_FIELDNAME: "document-pdf",
    PROFILE_PHOTO_MAX_SIZE: 2 * 1024 * 1024, // 2MB
    DOCUMENT_PDF_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    PROFILE_PHOTO_UPLOAD_PATH: path.join(__dirname, "../uploads/profiles"),
    DOCUMENT_PDF_UPLOAD_PATH: path.join(__dirname, "../uploads/documents"),
    UPLOAD_BASE_URL: `${process.env.BASE_URL}/uploads`,

    // User Authentication Constants
    UNVERIFIED_USER_EXPIRES_IN: "30m",
    PASSWORD_RESET_TOKEN_EXPIRES_IN: "10m",

    OTP: {
        EXPIRES_IN: "5m",
        LENGTH: 6,
    },

    JWT: {
        SECRET: process.env.JWT_SECRET,
        EXPIRES_IN: "90d",
        COOKIE_EXPIRES_IN: "90d",
    },

    // HTTP Status Codes
    HTTP: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        NOT_FOUND: 404,
        SERVER_ERROR: 500,
    },
};
