const mongoose = require("mongoose");
const { EMBEDDING_CONFIG } = require("./../configs/gemini.config");

const chunkSchema = new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: [true, "ERR: documentId filed can't be blank"],
        },
        chunkIndex: {
            type: Number,
            required: [true, "ERR: chunkIndex filed can't be blank"],
            min: [0, "ERR: chunkIndex must be a non-negative number"],
        },
        text: {
            type: String,
            required: [true, "ERR: text filed can't be blank"],
        },
        pageNumber: {
            type: Number,
            default: null,
        },
        embedding: {
            type: [Number],
            required: [true, "ERR: embedding filed can't be blank"],
            validate: {
                validator: function (v) {
                    return (
                        Array.isArray(v) &&
                        v.length === EMBEDDING_CONFIG.EMBEDDING_DIMENSION
                    );
                },
                message: `ERR: Embedding must be an array of ${EMBEDDING_CONFIG.EMBEDDING_DIMENSION} numbers`,
            },
        },
    },
    {
        timestamps: true,
    },
);

chunkSchema.index({ documentId: 1 });

////////////////////////////////////////
// Static Methods //////////////////////
// These methods will be available on the Model itself
// (called like: Model.methodName())

/*
    @description Delete all chunks belonging to a specific document
    @param       {String|ObjectId} documentId - Id of the document
    @returns     {Promise<Object>} - MongoDB delete result
*/

chunkSchema.statics.deleteChunksByDocumentId = function (documentId) {
    return this.deleteMany({ documentId: documentId });
};

const Chunk = mongoose.model("Chunk", chunkSchema);
module.exports = Chunk;
