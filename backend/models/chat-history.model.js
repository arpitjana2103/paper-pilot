const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "ERR: userId field can't be blank"],
        },
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: [true, "ERR: documentId field can't be blank"],
        },
        messages: [
            {
                role: {
                    type: String,
                    enum: ["user", "assistant"],
                    required: [true, "ERR: role field can't be blank"],
                },
                content: {
                    type: String,
                    required: [true, "ERR: content field can't be blank"],
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                relevantChunks: {
                    type: [Number],
                    default: [],
                },
            },
        ],
    },
    {
        timestamps: true,
    },
);

chatHistorySchema.index({ userId: 1, documentId: 1 });

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

module.exports = ChatHistory;
