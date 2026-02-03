const { genAI, EMBEDDING_CONFIG } = require("./../configs/gemini.config");

/*
    @desc    Generate embedding for a given text
    @param   {string} text - The text to generate embedding for
    @returns {Promise<Array<number>>} - The embedding for the text
*/

exports.generateEmbedding = async function (text, taskType) {
    try {
        // Validate input
        if (!text || typeof text !== "string") {
            throw new Error(
                "embeddingErr: Invalid text provided for embedding",
            );
        }

        if (text.trim().length === 0) {
            throw new Error("embeddingErr: Text is empty");
        }

        const maxCharCount = EMBEDDING_CONFIG.INPUT_TOKEN_LIMIT * 3.9;
        const truncatedText =
            text.length > maxCharCount ? text.substring(0, maxCharCount) : text;

        const response = await genAI.models.embedContent({
            model: EMBEDDING_CONFIG.MODEL,
            contents: [truncatedText],
            config: {
                outputDimensionality: EMBEDDING_CONFIG.EMBEDDING_DIMENSION,
                taskType: taskType,
            },
        });

        return response.embeddings.at(0).values;
    } catch (error) {
        throw new Error(error.message);
    }
};
