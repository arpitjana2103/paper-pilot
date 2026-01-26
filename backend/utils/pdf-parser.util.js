const fs = require("fs/promises");
const { PDFParse } = require("pdf-parse");
const { AppError } = require("../controllers/error.controller");
const { HTTP } = require("../configs/constants.config");

/**
 * Extracts text content and page count from a PDF file.
 * @param {string} filePath
 * Absolute or relative path to the PDF document.
 * @returns {Promise<{text:string, pageCount:number}>}
 * Resolves with an object containing the full extracted text and total page count.
 * @throws {AppError}
 * If the file cannot be read or text extraction fails.
 */

exports.extractTextFromPDF = async function (filePath) {
    let parser = null;
    try {
        const dataBuffer = await fs.readFile(filePath);
        parser = new PDFParse(new Uint8Array(dataBuffer));
        const data = await parser.getText();
        /*
        data = {
            pages: [
                { text: "<Page 1 Text >", num: 1 },
                { text: "<Page 2 Text >", num: 2 },
            ],
            text: "<All Text>",
            total: <Page-Count>,
        };
        */

        return {
            text: data.text,
            pageCount: data.total,
        };
    } catch (error) {
        console.log(error.message);
        throw new AppError("Failed to extract text from PDF", HTTP.BAD_REQUEST);
    } finally {
        if (parser && typeof parser.destroy === "function")
            await parser.destroy();
    }
};
