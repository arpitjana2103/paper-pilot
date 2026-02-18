const Chunk = require("../models/chunk.model");

exports.vectorSearch = async function ({ documentId, queryEmbedding }) {
    try {
        if (!documentId) {
            throw new Error("Document ID is required");
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
