const mongoose = require("mongoose");
const { DOCUMENT_PROCESS_MAX_RETRIES } = require("../configs/constants.config");

/*
req.file be like this:
{
  fieldname: 'profile-photo',
  originalname: 'profile.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'C:\\Users\\Arpit Jana\\Documents\\se-25-26\\Projects\\paper-pilot\\backend\\uploads\\profiles',
  filename: '6978f28cb40714461bea8216-profile.jpg',
  path: 'C:\\Users\\Arpit Jana\\Documents\\se-25-26\\Projects\\paper-pilot\\backend\\uploads\\profiles\\6978f28cb40714461bea8216-profile.jpg',    
  size: 98569
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
        originalName: {
            type: String,
            required: [true, "ERR: originalName filed can't be blank"],
            trim: true,
        },
        filePath: {
            type: String,
            required: [true, "ERR: filePath filed can't be blank"],
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

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;
