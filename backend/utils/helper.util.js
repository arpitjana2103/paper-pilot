const ms = require("ms");

/*
   @desc    Generates a random integer between min and max (inclusive)
   @param   {number} min
   @param   {number} max
   @returns {number}
*/

exports.getRandomNum = function (min, max) {
    const randomVal = Math.random();
    return Math.floor(randomVal * (max - min + 1)) + min;
};

/*
   @desc    Generates a random string of uppercase alphabets of a specified length
   @param   {number} length
   @returns {string}
*/

exports.getRandomAlphabets = function (length) {
    const randomArr = [];
    for (let i = 0; i < length; i++) {
        randomArr.push(exports.getRandomNum(65, 90));
    }
    return String.fromCharCode(...randomArr);
};

/*
   @desc    Converts a duration string to milliseconds
   @param   {string} durationStr
   @returns {number}
*/

exports.toMs = function (durationStr) {
    return ms(durationStr);
};

/*
   @desc    Checks if the application is running in the production environment
   @returns {boolean}
*/

exports.runningOnProd = function () {
    return process.env.NODE_ENV === "production";
};

/*
   @desc    Checks if the application is running in the development environment
   @returns {boolean}
*/

exports.runningOnDev = function () {
    return process.env.NODE_ENV === "development";
};

/*
   @desc    Calculates the expiration date based on the current time and a duration
   @param   {string} duration
   @returns {Date}
*/

exports.expiresAt = function (duration) {
    return new Date(Date.now() + exports.toMs(duration));
};

/*
   @desc    Sanitizes a filename by replacing special characters with underscores, collapsing  
            multiple dots to one, and converting to lowercase
   @param   {string} filename
   @returns {string}
*/

exports.sanitizeFilename = function (filename) {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace special chars
        .replace(/\.+/g, ".") // Multiple dots to single
        .toLowerCase();
};
