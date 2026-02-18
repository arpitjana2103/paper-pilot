const mongoose = require("mongoose");
const { DOCUMENT_PROCESS_MAX_RETRIES } = require("../configs/constants.config");
const { processDocument } = require("./../services/process-document.service");

/*
req.file be like this:
{
  filename: '<server-generated-unique-filename>',
  originalname: '<client-defined-filename>',
  fieldname: '<form-field-name>',
  encoding: '<encoding-type>',
  mimetype: '<file-mime-type>',
  destination: '<destination-dir-at-server>',
  path: '<full-path-to-file-on-server>',
  size: <file-size-in-bytes>
}
*/

const documentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "ERR: userId filed can't be blank"],
        },
        fileName: {
            type: String,
            required: [true, "ERR: fileName filed can't be blank"],
            trim: true,
        },
        title: {
            type: String,
            trim: true,
            required: [true, "ERR: title filed can't be blank"],
            minlength: [1, "ERR: Invalid field value"],
            maxlength: [40, "ERR: Title cannot be more than 40 characters"],
        },
        originalName: {
            type: String,
            required: [true, "ERR: originalName filed can't be blank"],
            trim: true,
        },
        filePath: {
            type: String,
            required: [true, "ERR: filePath filed can't be blank"],
        },
        fileUrl: {
            type: String,
        },
        fileSize: {
            value: {
                type: Number,
                required: [true, "ERR: fileSize.value filed can't be blank"],
                min: [0, "ERR: fileSize.value must be a non-negative number"],
            },
            unit: {
                type: String,
                enum: ["byte", "kilobyte", "megabyte"],
                default: "byte",
            },
        },
        mimeType: {
            type: String,
            required: [true, "ERR: mimeType filed can't be blank"],
            default: "application/pdf",
        },
        status: {
            type: String,
            enum: {
                values: ["processing", "ready", "failed", "retrying"],
                message:
                    "Status must be processing, ready, failed, or retrying",
            },
            default: "processing",
        },
        totalPages: {
            type: Number,
            default: 0,
        },
        totalChunks: {
            type: Number,
            default: 0,
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
        processedAt: {
            type: Date,
            default: null,
        },
        retryCount: {
            type: Number,
            default: 0,
            min: [0, "ERR: retryCount must be a non-negative number"],
        },
        maxRetries: {
            type: Number,
            default: DOCUMENT_PROCESS_MAX_RETRIES,
        },
        lastError: {
            type: String,
            default: null,
        },
        metadata: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true },
);

documentSchema.index({ userId: 1 });

////////////////////////////////////////
// VIRTUAL FIELDS //////////////////////

documentSchema.virtual("isReady").get(function () {
    return this.status === "ready";
});

documentSchema.virtual("isFailed").get(function () {
    return this.status === "failed";
});

documentSchema.virtual("canRetry").get(function () {
    return this.status === "failed" && this.retryCount < this.maxRetries;
});

////////////////////////////////////////
// DOCUMENT MIDDLEWARE / HOOK //////////

/*
    @description Capture whether the document is newly created
    Used later in post-save hook to trigger processing only once
*/

documentSchema.pre("save", function () {
    this._wasNew = this.isNew;
});

/*
    @description Trigger document processing after initial creation
    Runs only when the document is first saved to DB
*/

documentSchema.post("save", function (doc) {
    if (doc._wasNew) {
        processDocument(doc);
    }
});

////////////////////////////////////////
// Instance Methods ////////////////////
// These Methods will be available for all the Model instances
// (called like: document.methodName())

/*
    @description Mark document as ready after successful processing
    @param       {Object} params - Processing metadata
    @param       {Number} params.totalPages - Total pages extracted from document
    @param       {Number} params.totalChunks - Total chunks generated
    @returns     {Promise<Document>} - A promise that resolves to the updated document
*/

documentSchema.methods.markAsReady = function ({ totalPages, totalChunks }) {
    this.status = "ready";
    this.totalPages = totalPages;
    this.totalChunks = totalChunks;
    this.processedAt = new Date();
    this.lastError = null;
    return this.save();
};

/*
    @description Mark document as failed when processing encounters an error
    @param       {String} errorMessage - Error message describing the failure
    @returns     {Promise<Document>} - A promise that resolves to the updated document
*/

documentSchema.methods.markAsFailed = function (errorMessage) {
    this.status = "failed";
    this.lastError = errorMessage;
    this.processedAt = new Date();
    return this.save();
};

////////////////////////////////////////
// Static Methods //////////////////////
// These methods will be available on the Model itself
// (called like: Model.methodName())

/*
    @description Fetch documents belonging to a specific user with optional filters
    @param       {String|ObjectId} userId - The ID of the user who owns the documents
    @param       {Object} [options={}] - Optional query filters
    @param       {String} [options.status] - Filter documents by status
    @returns     {Query<Document[]>} - A mongoose query that resolves to an array of documents
*/

documentSchema.statics.findByUser = function (userId, options = {}) {
    const query = this.find({ userId: userId });
    if (options.status) {
        query.where("status").equals(options.status);
    }
    return query;
};

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;
