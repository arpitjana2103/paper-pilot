const ms = require("ms");

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random integer between min and max
 */

exports.getRandomNum = function (min, max) {
    const randomVal = Math.random();
    return Math.floor(randomVal * (max - min + 1)) + min;
};

/**
 * Generates a random string of uppercase alphabets of a specified length
 * @param {number} length - The length of the string to generate
 * @returns {string} A random string of uppercase alphabets
 */
exports.getRandomAlphabets = function (length) {
    const randomArr = [];
    for (let i = 0; i < length; i++) {
        randomArr.push(exports.getRandomNum(65, 90));
    }
    return String.fromCharCode(...randomArr);
};

/**
 * Converts a duration string to milliseconds
 * @param {string} durationStr - The duration string (e.g., '1h', '2d')
 * @returns {number} The duration in milliseconds
 */
exports.toMs = function (durationStr) {
    return ms(durationStr);
};

/**
 * Checks if the application is running in the production environment
 * @returns {boolean} True if running in production, false otherwise
 */
exports.runningOnProd = function () {
    return process.env.NODE_ENV === "production";
};

/**
 * Checks if the application is running in the development environment
 * @returns {boolean} True if running in development, false otherwise
 */
exports.runningOnDev = function () {
    return process.env.NODE_ENV === "development";
};

/**
 * Calculates the expiration date based on the current time and a duration
 * @param {string} duration - The duration string (e.g., '1h', '2d')
 * @returns {Date} The expiration date
 */
exports.expiresAt = function (duration) {
    return new Date(Date.now() + exports.toMs(duration));
};
