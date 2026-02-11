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
        DOCUMENT: "RETRIEVAL_DOCUMENT",
        QUERY: {
            GENERAL: "RETRIEVAL_QUERY",
            CODE: "CODE_RETRIEVAL_QUERY",
            QNA: "QUESTION_ANSWERING",
            FACT_CHECK: "FACT_VERIFICATION",
        },
    },
};

module.exports = {
    genAI,
    EMBEDDING_CONFIG,
};
