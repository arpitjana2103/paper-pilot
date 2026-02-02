const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { ClientError } = require("./../services/error.service");
const { CHUNK_SIZE, CHUNK_OVERLAP } = require("../configs/constants.config");

/*
    @desc    Split text into chunks using RecursiveCharacterTextSplitter
    @param   {string} text 
    @returns {Promise<string[]>}
*/

async function splitTextIntoChunks(text) {
    const chunkSize = CHUNK_SIZE;
    const chunkOverlap = CHUNK_OVERLAP;

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap,
        separators: [],
        keepSeparator: true,
    });

    const textChunks = await splitter.splitText(text);
    return textChunks;
}

/*
    @desc    Splits page text into chunks with metadata
    @param   {Array<{pageNumber: number, text: string}>} pages
    @returns {Promise<Array<{chunkIndex: number, text: string, pageNumber: number}>>}
*/

exports.createChunks = async function (pages) {
    try {
        let res = [];
        for (const { pageNumber, text } of pages) {
            const cleanedText = text
                .replace(/\n(?!\n)/g, " ") // Single \n becomes space
                .replace(/\n{2,}/g, "\n\n") // Multiple \n becomes exactly \n\n
                .replace(/ {2,}/g, " ") // Multiple spaces become single space
                .trim();

            const chunks = await splitTextIntoChunks(cleanedText);
            const mappedChunks = chunks.map(function (chunk, index) {
                return {
                    chunkIndex: index,
                    text: chunk,
                    pageNumber: pageNumber,
                };
            });
            res = res.concat(mappedChunks);
        }

        return res;
    } catch (error) {
        throw new Error(error.message);
    }
};
