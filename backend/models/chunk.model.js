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
// Instance Method /////////////////////

/*
    @description Find all chunks by documentId
    @param       {String} docuementId - The documentId to search for
    @returns     {Promise<Array>} - A promise that resolves to an array of chunks
*/

chunkSchema.methods.findByDocument = function (documentId) {
    return this.find({ documentId }).sort({ chunkIndex: 1 }).select("-__v");
};

/*
    @description Count chunks by documentId
    @param       {String} documentId - The documentId to search for
    @returns     {Promise<Number>} - A promise that resolves to the number of chunks
*/

chunkSchema.static.countByDocument = function (documentId) {
    return this.countDocuments({ documentId });
};

/*
    @description Delete all chunks by documentId
    @param       {String} documentId - The documentId to search for
    @returns     {Promise<Number>} - A promise that resolves to the number of chunks deleted
*/

chunkSchema.static.deleteByDocument = function (documentId) {
    return this.deleteMany({ documentId });
};

const Chunk = mongoose.model("Chunk", chunkSchema);
module.exports = Chunk;

/*
 // Chunk 0 - Page 1
 {
   _id: ObjectId("65b8f9a2c4d5e6f7a8b9c0d1"),
   documentId: ObjectId("65b8f9a1c4d5e6f7a8b9c0d0"),
   chunkIndex: 0,
   text: "Introduction to Machine Learning\n\nMachine learning is a subset of artificial intelligence...",
   embedding: [0.023, -0.012, 0.045, // ...765 more ],
   metadata: {
     pageNumber: 1,
     startChar: 0,
     endChar: 487
   },
   createdAt: ISODate("2024-01-30T10:30:00.000Z"),
   updatedAt: ISODate("2024-01-30T10:30:00.000Z")
 }

 // Chunk 1 - Page 1 (overlap with Chunk 0)
 {
   _id: ObjectId("65b8f9a2c4d5e6f7a8b9c0d2"),
   documentId: ObjectId("65b8f9a1c4d5e6f7a8b9c0d0"),
   chunkIndex: 1,
   text: "look for patterns in data and make better decisions in the future.\n\nTypes of Machine Learning\n\nThere are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning. Supervised learning involves training a model on labeled data...",
   embedding: [0.034, -0.023, 0.056, // ...765 more ],
   metadata: {
     pageNumber: 1,
     startChar: 287,  // Note: overlap with previous chunk
     endChar: 874
   },
   createdAt: ISODate("2024-01-30T10:30:01.000Z"),
   updatedAt: ISODate("2024-01-30T10:30:01.000Z")
 }

 // Chunk 2 - Page 2
 {
   _id: ObjectId("65b8f9a2c4d5e6f7a8b9c0d3"),
   documentId: ObjectId("65b8f9a1c4d5e6f7a8b9c0d0"),
   chunkIndex: 2,
   text: "Supervised learning involves training a model on labeled data where the correct output is known. The algorithm learns to map inputs to outputs based on example input-output pairs...",
   embedding: [0.045, -0.034, 0.067, // ...765 more ],
   metadata: {
     pageNumber: 2,
     startChar: 674,
     endChar: 1361
   },
   createdAt: ISODate("2024-01-30T10:30:02.000Z"),
   updatedAt: ISODate("2024-01-30T10:30:02.000Z")
 }
*/
