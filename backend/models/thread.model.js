const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "ERR: User ID can't be blank"],
        },
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: [true, "ERR: Document ID can't be blank"],
        },
        title: {
            type: String,
            required: [true, "ERR: Thread title can't be blank"],
            trim: true,
            maxLength: [200, "Title cannot exceed 200 characters"],
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

threadSchema.index({ userId: 1, documentId: 1 });
threadSchema.index({ documentId: 1, lastMessageAt: -1 });
threadSchema.index({ createdAt: -1 });

const Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;
