const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
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
        title: {
            type: String,
            required: [true, "ERR: title field can't be blank"],
            trim: true,
        },
        questions: [
            {
                question: {
                    type: String,
                    required: [true, "ERR: question field can't be blank"],
                },
                options: {
                    type: [String],
                    required: [true, "ERR: options field can't be blank"],
                    validate: {
                        validator: function (array) {
                            return array.length === 4;
                        },
                        message: "ERR: must have exactly 4 options",
                    },
                },
                correctAnswer: {
                    type: String,
                    required: [true, "ERR: correctAnswer field can't be blank"],
                },
                explanation: {
                    type: String,
                    default: "",
                },
                difficulty: {
                    type: String,
                    enum: ["easy", "medium", "hard"],
                    default: "medium",
                },
            },
        ],
        userAnswers: [
            {
                questionsIndex: {
                    type: Number,
                    required: [true, "ERR: questionsIndex field can't be blank"],
                },
                selectedAnswer: {
                    type: String,
                    required: [true, "ERR: selectedAnswer field can't be blank"],
                },
                isCorrect: {
                    type: Boolean,
                    required: [true, "ERR: isCorrect field can't be blank"],
                },
                answeredAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        score: {
            type: Number,
            default: 0,
        },
        totalQuestions: {
            type: Number,
            required: [true, "ERR: totalQuestions field can't be blank"],
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
