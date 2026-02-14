const { HTTP, UPLOAD_BASE_URL } = require("../configs/constants.config");
const Document = require("../models/document.model");
const Chunk = require("../models/chunk.model");
const { catchAsyncErrors, ClientError } = require("../services/error.service");
const { removeFile } = require("../configs/multer.config");

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

    const fileUrl = `${UPLOAD_BASE_URL}/documents/${req.user._id.toString()}/${req.file.filename}`;

    const document = await Document.create({
        userId: req.user._id,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        title: req.file.originalname,
        filePath: req.file.path,
        fileUrl: fileUrl,
        fileSize: { value: req.file.size, unit: "byte" },
        mimeType: req.file.mimetype,
        status: "processing",
    });

    return res.status(HTTP.CREATED).json({
        status: "success",
        message: "Document created successfully",
        data: {
            document: {
                id: document._id,
                title: document.title,
                originalName: document.originalName,
                fileUrl: document.fileUrl,
                status: document.status,
                uploadedAt: document.uploadedAt,
            },
        },
    });
});

/*
	@description Get all documents belongs to logged in user
	@route 		 GET /documents?status={value}
	@access      Private
	@middleware  [authProtect]
*/

exports.getDocuments = catchAsyncErrors(async function (req, res, next) {
    const userId = req.user._id;
    const { status } = req.query;

    const documents = await Document.findByUser(userId, { status }).select(
        "_id originalName fileSize status totalPages uploadedAt lastError canRetry",
    );

    return res.status(HTTP.OK).json({
        status: "success",
        count: documents.length,
        data: {
            documents: documents,
        },
    });
});

/*
	@description Get document status ( for polling )
	@route 		 Get /documents/:id/status
	@Access		 Private
	@middleware  [authProtect], [validateDocumentOwnership]
*/

exports.getDocumentStatus = catchAsyncErrors(async function (req, res, next) {
    const document = req.document;

    return res.status(HTTP.OK).json({
        status: "success",
        data: {
            status: {
                id: document._id,
                status: document.status,
                lastError: document.lastError ?? undefined,
            },
        },
    });
});

/*
	@description Update Document ( titel )
	@route 		 PATCH /documents/:id
	@middleware  [authProtect], [validateDocumentOwnership]
*/

exports.updateDocument = catchAsyncErrors(async function (req, res, next) {
    const document = await Document.findByIdAndUpdate(
        req.document._id,
        { title: req.body.title },
        { new: true, runValidators: true },
    );

    return res.status(HTTP.OK).json({
        status: "success",
        message: "Document updated successfully",
        data: {
            document: {
                id: document._id,
                title: document.title,
            },
        },
    });
});

/*
	@description Delete document
	@route 	     DELETE /doucments/:id
	@middleware  [authProtect], [validateDocumentOwnership]
*/

exports.deleteDocument = catchAsyncErrors(async function (req, res, next) {
    const document = req.document;

    // [1] Delte Chunks of the doucment from db
    await Chunk.deleteChunksByDocumentId(document._id);

    // [2] Delte file from memory
    removeFile(document.filePath);

    // [3] Delete the document from db
    await Document.findByIdAndDelete(document._id);

    return res.status(HTTP.OK).json({
        status: "success",
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
