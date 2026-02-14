const express = require("express");

const documentController = require("./../controllers/document.controller");
const authController = require("./../controllers/auth.controller");

const {
    uploadDocument,
    cleanupFileOnError,
} = require("../configs/multer.config");
const { DOCUMENT_PDF_FIELDNAME } = require("../configs/constants.config");

const router = express.Router();

// Protected Routes
router.use(authController.authProtect);

router
    .route("/")
    .get(documentController.getDocuments)
    .post(
        uploadDocument.single(DOCUMENT_PDF_FIELDNAME),
        documentController.createDocument,
        cleanupFileOnError,
    );

router
    .route("/:id/status")
    .get(
        documentController.validateDocumentOwnership,
        documentController.getDocumentStatus,
    );

module.exports = router;
