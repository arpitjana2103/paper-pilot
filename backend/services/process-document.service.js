const { EMBEDDING_CONFIG } = require("../configs/gemini.config");
const Chunk = require("../models/chunk.model");
const { createChunks } = require("./chunking.service");
const { generateEmbedding } = require("./embedding.service");
const { extractTextFromPDF } = require("./pdf-parser.service");

/*
    @description Process uploaded document
    @param       {Document} document - Mongoose document instance
    @returns     {Promise<void>}
*/

exports.processDocument = async function (document) {
    try {
        // [1] Extract Text From Document-PDF
        const pdfData = await extractTextFromPDF(document.filePath);

        // [2] Create Chunks
        const chunks = await createChunks(pdfData);

        // [3] Generate Embeddings
        const chunksWithEmbeddings = await Promise.all(
            chunks.map(async function (chunk) {
                return {
                    documentId: document._id,
                    chunkIndex: chunk.chunkIndex,
                    text: chunk.text,
                    pageNumber: chunk.pageNumber,
                    embedding: await generateEmbedding({
                        text: chunk.text,
                        taskType: EMBEDDING_CONFIG.TASK_TYPES.DOCUMENT,
                    }),
                };
            }),
        );

        await Chunk.insertMany(chunksWithEmbeddings);
        await document.markAsReady({
            totalPages: pdfData.length,
            totalChunks: chunks.length,
        });
    } catch (error) {
        await document.markAsFailed(error.message);
        await Chunk.deleteMany({ documentId: document._id });
    }
};
