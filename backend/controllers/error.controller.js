const { HTTP } = require("../configs/constants.config");
const helper = require("./../utils/helper.util");

exports.AppError = class extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        // Error.captureStackTrace(this, this.constructor);

        /*
        Error.captureStackTrace(this, this.constructor) : Explanation
        -------------------------------------------------------------
        this → refers to the current instance of your AppError.
        this.constructor → refers to the AppError class itself.

        This tells JavaScript:
        "Start the stack trace from this point, and exclude everything above this constructor."
        */
    }
};

exports.catchAsyncErrors = function (asyncFunc) {
    return function (req, res, next) {
        asyncFunc(req, res, next).catch(function (err) {
            // console.log("[Caught Async Error]", err);
            return next(err);
        });
    };
};

exports.globalErrorHandeller = function (err, req, res, next) {
    err.statusCode = err.statusCode || HTTP.SERVER_ERROR;
    err.status = err.status || "error";

    if (helper.runningOnDev()) {
        return sendErrForDev(err, res);
    }

    if (helper.runningOnProd()) {
        return sendErrForProd(err, res);
    }
};

/////////////////////////////////////////////////
//// Helper Functions for Error Handelling //////

function sendErrForDev(err, res) {
    return res.status(err.statusCode).json({
        env: "development",
        status: "error",
        message: err.message,
        error: err,
        stack: err.stack,
    });
}

function sendErrForProd(err, res) {
    // Handle DB Cast Error
    // Exmple : Search for Invalid ID
    err = handleCastErrorDB(err);

    // Handle Duplicate Field Value Error
    // Exmple : Repeating field value for unique field
    err = handleDuplicateFieldsDB(err);

    // Handle Validation Error
    // Exmple : Fail schema validation
    err = handleValidationError(err);

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            env: "production",
            status: err.status,
            message: err.message,
        });
    }

    // Unknown Error Handelling in Production
    return res.status(HTTP.SERVER_ERROR).json({
        env: "production",
        status: "error",
        message: "Something went very wrong !",
    });
}

function handleCastErrorDB(err) {
    if (err.name === "CastError") {
        const message = `[Invalid] ${err.path}: "${err.value}" is not a valid value.`;
        return new exports.AppError(message, HTTP.BAD_REQUEST);
    }
    return err;
}

function handleDuplicateFieldsDB(err) {
    if (err.code === 11000) {
        const message = `[Duplicate field value] ${JSON.stringify(err.keyValue)}`;
        return new exports.AppError(message, HTTP.BAD_REQUEST);
    }
    return err;
}

function handleValidationError(err) {
    if (err.name === "ValidationError") {
        const { message } = err;
        return new exports.AppError(message, HTTP.BAD_REQUEST);
    }
    return err;
}
