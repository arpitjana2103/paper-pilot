const multer = require("multer");
const fs = require("fs");
const { AppError } = require("../controllers/error.controller");
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
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const profileFilter = (req, file, cb) => {
    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
        return cb(
            new AppError(
                `field: ${PROFILE_PHOTO_FIELDNAME}, Only image files (JPEG/PNG) are allowed`,
                HTTP.BAD_REQUEST,
            ),
            false,
        );
    }
    cb(null, true);
};

const documentFilter = (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
        return cb(
            new AppError(
                `field: ${DOCUMENT_PDF_FIELDNAME}, Expected: application/pdf. Received: ${file.mimetype}`,
                HTTP.BAD_REQUEST,
            ),
            false,
        );
    }

    cb(null, true);
};

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        genPath(PROFILE_PHOTO_UPLOAD_PATH);
        return cb(null, PROFILE_PHOTO_UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
        const fileName = sanitizeFilename(file.originalname);
        cb(null, `${req.user._id}-${fileName}`);
    },
});

const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const pdfUploadPath = `${DOCUMENT_PDF_UPLOAD_PATH}/${req.user._id}`;
        genPath(pdfUploadPath);
        return cb(null, pdfUploadPath);
    },
    filename: function (req, file, cb) {
        const fileName = sanitizeFilename(file.originalname);
        cb(null, `${req.user._id}-${Date.now()}-${fileName}`);
    },
});

const uploadProfile = multer({
    fileFilter: profileFilter,
    storage: profileStorage,
    limits: { fileSize: PROFILE_PHOTO_MAX_SIZE },
});

const uploadDocument = multer({
    fileFilter: documentFilter,
    storage: documentStorage,
    limits: { fileSize: DOCUMENT_PDF_MAX_SIZE },
});

module.exports = { uploadProfile, uploadDocument };
