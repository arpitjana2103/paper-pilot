const { HTTP } = require("../configs/constants.config");
const Document = require("../models/document.model");
const { catchAsyncErrors, ClientError } = require("../services/error.service");

/*
    @description Create new document record after file upload
    @route       POST /documents
    @access      Private
    @middleware  [authProtect], [uploadDocument.single(DOCUMENT_PDF_FIELDNAME)]
*/

exports.createDocument = catchAsyncErrors(async function (req, res, next) {
    if (!req.file) {
        throw new ClientError("No file found to upload", HTTP.BAD_REQUEST);
    }

    const document = await Document.create({
        userId: req.user._id,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: { value: req.file.size, unit: "byte" },
        mimeType: req.file.mimetype,
        status: "processing",
    });

    return res.status(HTTP.CREATED).json({
        status: "success",
        message: "Document created successfully",
        document: {
            id: document._id,
            originalName: document.originalName,
            status: document.status,
            uploadedAt: document.uploadedAt,
        },
    });
});

/*
	[MIDDLEWARE]
	@description Validate if the docuemnt belongs to logged in user
	@access      Private
*/

exports.validateDocumentOwnership = catchAsyncErrors(
    async function (req, res, next) {
        const documentId = req.params.id;
        const userId = req.user._id;

        const document = await Document.findById(documentId);

        if (!document)
            throw new ClientError("Document not found", HTTP.NOT_FOUND);

        if (document.userId.toString() !== userId.toString()) {
            throw new ClientError("Access denied", HTTP.FORBIDDEN);
        }

        req.document = document;
        next();
    },
);
