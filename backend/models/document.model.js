const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "ERR: userId field can't be blank"],
        },
        title: {
            type: String,
            required: [true, "ERR: title field can't be blank"],
            trim: true,
        },
        fileName: {
            type: String,
            required: [true, "ERR: fileName field can't be blank"],
        },
        filePath: {
            type: String,
            required: [true, "ERR: filePath field can't be blank"],
        },
        fileSize: {
            type: Number,
            required: [true, "ERR: fileSize field can't be blank"],
        },
        extractedText: {
            type: String,
        },
        chunks: [
            {
                content: {
                    type: String,
                    required: [true, "ERR: content field can't be blank"],
                },
                pageNumber: {
                    type: Number,
                    default: 0,
                },
                chunkIndex: {
                    type: Number,
                    required: [true, "ERR: chunkIndex field can't be blank"],
                },
            },
        ],
        uploadDate: {
            type: Date,
            default: Date.now,
        },
        lastAccessed: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["processing", "ready", "failed"],
            default: "processing",
        },
    },
    {
        timestamps: true,
    },
);

documentSchema.index({ userId: 1, uploadDate: -1 });

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
