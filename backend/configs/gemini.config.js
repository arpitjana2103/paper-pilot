const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "..", "config.env") });

const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Embedding configuration
const EMBEDDING_CONFIG = {
    MODEL: "gemini-embedding-001",
    EMBEDDING_DIMENSION: 768,
    INPUT_TOKEN_LIMIT: 2048,
    TASK_TYPES: {
        SEMANTIC_SIMILARITY: "SEMANTIC_SIMILARITY",
        CLASSIFICATION: "CLASSIFICATION",
        CLUSTERING: "CLUSTERING",
        RETRIEVAL_DOCUMENT: "RETRIEVAL_DOCUMENT", // For indexing documents
        RETRIEVAL_QUERY: "RETRIEVAL_QUERY", // For search queries
        CODE_RETRIEVAL_QUERY: "CODE_RETRIEVAL_QUERY",
        QUESTION_ANSWERING: "QUESTION_ANSWERING", // For user questions
        FACT_VERIFICATION: "FACT_VERIFICATION",
    },
};

module.exports = {
    genAI,
    EMBEDDING_CONFIG,
};
