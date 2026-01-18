const ms = require("ms");

exports.getRandomNum = function (min, max) {
    const randomVal = Math.random();
    return Math.floor(randomVal * (max - min + 1)) + min;
};

exports.getRandomAlphabets = function (length) {
    const randomArr = [];
    for (let i = 0; i < length; i++) {
        randomArr.push(exports.getRandomNum(65, 90));
    }
    return String.fromCharCode(...randomArr);
};

exports.toMs = function (durationStr) {
    return ms(durationStr);
};

exports.runningOnProd = function () {
    return process.env.NODE_ENV === "production";
};

exports.runningOnDev = function () {
    return process.env.NODE_ENV === "development";
};
