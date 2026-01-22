const { toMs } = require("./../utils/helper.util");

module.exports = {
    EMAIL_OTP: {
        EXPIRES_IN: new Date(Date.now() + toMs("30m")), // 5 minutes in milliseconds
        LENGTH: 6,
    },

    JWT: {
        SECRET: process.env.JWT_SECRET,
        EXPIRES_IN: "90d",
        COOKIE_EXPIRES_IN: new Date(Date.now() + toMs("90d")),
    },

    HTTP: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        NOT_FOUND: 404,
        SERVER_ERROR: 500,
    },
};
