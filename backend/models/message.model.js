const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        threadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread",
            required: [true, "ERR: Thread ID cann't be blank"],
        },
        role: {
            type: String,
            enum: {
                values: ["user", "assistant"],
                message: "ERR: Role must be either 'user' or 'assistant'",
            },
            required: [true, "ERR: Role cann't be blank"],
        },
        content: {
            type: String,
            required: [true, "ERR: Message content cann't be blank"],
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

messageSchema.index({ threadId: 1, timestamp: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
