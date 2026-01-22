const { toMs } = require("./../utils/helper.util");

module.exports = {
    UNVERIFIED_USER_EXPIRES_IN: "30m",

    OTP: {
        EXPIRES_IN: "5m",
        LENGTH: 6,
    },

    JWT: {
        SECRET: process.env.JWT_SECRET,
        EXPIRES_IN: "90d",
        COOKIE_EXPIRES_IN: "90d",
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
