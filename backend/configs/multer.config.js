const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { ClientError } = require("../services/error.service");
const {
    PROFILE_PHOTO_UPLOAD_PATH,
    DOCUMENT_PDF_UPLOAD_PATH,
    PROFILE_PHOTO_MAX_SIZE,
    DOCUMENT_PDF_MAX_SIZE,
    PROFILE_PHOTO_FIELDNAME,
    DOCUMENT_PDF_FIELDNAME,
    HTTP,
} = require("./constants.config");
const { sanitizeFilename } = require("../utils/helper.util");

const genPath = function (dir) {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
        throw new Error(
            `multerErr: Directory creation failed: ${error.message}`,
        );
    }
};

const profileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png"];
    const allowedExtensions = ["jpg", "jpeg", "png"];

    const ext = file.originalname.toLowerCase().split(".").pop();

    if (
        !allowedMimeTypes.includes(file.mimetype) ||
        !allowedExtensions.includes(ext)
    ) {
        return cb(
            new ClientError(
                `field: ${PROFILE_PHOTO_FIELDNAME}, File: "${file.originalname}" - Only JPEG/PNG images are allowed`,
                HTTP.BAD_REQUEST,
            ),
            false,
        );
    }
    cb(null, true);
};

const documentFilter = (req, file, cb) => {
    const ext = file.originalname.toLowerCase().split(".").pop();

    if (file.mimetype !== "application/pdf" || ext !== "pdf") {
        return cb(
            new ClientError(
                `field: ${DOCUMENT_PDF_FIELDNAME}, File: "${file.originalname}" - Expected: application/pdf,  Received: ${file.mimetype}`,
                HTTP.BAD_REQUEST,
            ),
            false,
        );
    }
    cb(null, true);
};

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            genPath(PROFILE_PHOTO_UPLOAD_PATH);
            return cb(null, PROFILE_PHOTO_UPLOAD_PATH);
        } catch (error) {
            return cb(error);
        }
    },
    filename: function (req, file, cb) {
        const fileName = sanitizeFilename(file.originalname);
        cb(null, `${req.user._id}-${fileName}`);
    },
});

const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            const pdfUploadPath = path.join(
                DOCUMENT_PDF_UPLOAD_PATH,
                req.user._id.toString(),
            );

            genPath(pdfUploadPath);
            return cb(null, pdfUploadPath);
        } catch (error) {
            return cb(error);
        }
    },
    filename: function (req, file, cb) {
        const fileName = sanitizeFilename(file.originalname);
        cb(null, `${req.user._id}-${Date.now()}-${fileName}`);
    },
});

/*
    [MIDDLEWARE FACTORY]
    @description Creates a Multer upload middleware for handling profile photo uploads.
                 Parses incoming "multipart/form-data" and attaches the file to `req.file`
                 and text fields to `req.body`.
    @returns     {Object} Multer instance. Use `.single()`, `.array()`, or `.fields()` to create middleware.
*/

const uploadProfile = multer({
    fileFilter: profileFilter,
    storage: profileStorage,
    limits: { fileSize: PROFILE_PHOTO_MAX_SIZE },
});

/*
    [MIDDLEWARE FACTORY]
    @description Creates a Multer upload middleware for handling document PDF uploads.
                 Parses incoming "multipart/form-data" and attaches the file to `req.file`
                 and text fields to `req.body`.
    @returns     {Object} Multer instance. Use `.single()`, `.array()`, or `.fields()` to create middleware.
*/

const uploadDocument = multer({
    fileFilter: documentFilter,
    storage: documentStorage,
    limits: { fileSize: DOCUMENT_PDF_MAX_SIZE },
});

const removeFile = function (filePath) {
    fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error("Failed to delete file:", unlinkErr);
    });
};

/*
    [MIDDLEWARE]
    @description: Middleware to clean up uploaded files if an error occurs.
    @param {Error} err - The error object.
    @param {Object} req - The request object.
    @param {Object} res - The response object.
    @param {Function} next - The next middleware function.
*/

const cleanupFileOnError = (err, req, res, next) => {
    if (err && req.file) {
        removeFile(req.file.path);
    }
    next(err);
};

module.exports = {
    uploadProfile,
    uploadDocument,
    cleanupFileOnError,
    removeFile,
};
