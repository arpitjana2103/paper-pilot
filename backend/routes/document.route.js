const express = require("express");

const documentController = require("./../controllers/document.controller");
const authController = require("./../controllers/auth.controller");

const { uploadDocument } = require("../configs/multer.config");
const { DOCUMENT_PDF_FIELDNAME } = require("../configs/constants.config");

const router = express.Router();

// Protected Routes
router.use(authController.authProtect);

router
    .route("/")
    .post(
        uploadDocument.single(DOCUMENT_PDF_FIELDNAME),
        documentController.createDocument,
    );

module.exports = router;
