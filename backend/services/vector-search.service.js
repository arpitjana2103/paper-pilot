const mongoose = require("mongoose");
const Chunk = require("../models/chunk.model");

/*
    @description Perform vector similarity search on document chunks
    Uses MongoDB $vectorSearch to find most relevant chunks
    based on query embedding within a specific document.
    @param       {Object} params
    @param       {String|ObjectId} params.documentId - Target document id
    @param       {Number[]} params.queryEmbedding - Embedding vector (length: 768)
    @returns     {Promise<Array>} - Array of matched chunks with score
*/

exports.vectorSearch = async function ({ documentId, queryEmbedding }) {
    try {
        if (!documentId) {
            throw new Error("Document ID is required");
        }

        if (!(documentId instanceof mongoose.Types.ObjectId)) {
            if (!mongoose.Types.ObjectId.isValid(documentId)) {
                throw new Error("Invalid Document ID");
            }
            documentId = new mongoose.Types.ObjectId(documentId);
        }

        if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 768) {
            throw new Error("Query embedding must be an array of 768 numbers");
        }

        const results = await Chunk.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: 5,
                    filter: {
                        documentId: documentId,
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    text: 1,
                    pageNumber: 1,
                    embedding: 0,
                    score: { $meta: "vectorSearchScore" },
                },
            },
            {
                $sort: {
                    score: -1,
                },
            },
        ]);

        return results;
    } catch (error) {
        throw new Error("vectorSearchErr :", error.message);
    }
};
