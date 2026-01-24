const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
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
        cards: [
            {
                question: {
                    type: String,
                    required: [true, "ERR: question field can't be blank"],
                },
                answer: {
                    type: String,
                    required: [true, "ERR: answer field can't be blank"],
                },
                difficulty: {
                    type: String,
                    enum: ["easy", "medium", "hard"],
                    default: "medium",
                },
                lastReviewed: {
                    type: Date,
                },
                reviewCount: {
                    type: Number,
                    default: 0,
                },
                isStarred: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    {
        timestamps: true,
    },
);

flashcardSchema.index({ userId: 1, documentId: 1 });

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

module.exports = Flashcard;
