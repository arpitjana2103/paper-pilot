const fs = require("fs/promises");
const path = require("path");

const { PDFParse } = require("pdf-parse");
const { ClientError } = require("./error.service");
const { HTTP, DOCUMENT_MAX_SIZE } = require("../configs/constants.config");

/*
   @desc    Extracts text content and page count from a PDF file.
   @param   {string} filePath
   @returns {Promise<Array<{pageNumber:number, text:string, charCount:number}>>}
   @throws  {ClientError}
*/

exports.extractTextFromPDF = async function (filePath) {
    let parser = null;
    try {
        // Validate file path
        if (!filePath || typeof filePath !== "string") {
            throw new Error("Invalid file path provided");
        }

        const dataBuffer = await fs.readFile(filePath);

        if (dataBuffer.length === 0) {
            throw new Error("PDF file is empty");
        }

        const header = dataBuffer.toString("utf-8", 0, 5);
        if (header !== "%PDF-") {
            throw new ClientError(
                "Invalid PDF file. File does not have valid PDF signature.",
                HTTP.BAD_REQUEST,
            );
        }

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

        if (!data.text || data.text.trim().length === 0) {
            throw new ClientError("No text found in PDF", HTTP.BAD_REQUEST);
        }

        const pages = data.pages.map(function (pageObj) {
            return {
                pageNumber: pageObj.num,
                text: pageObj.text,
                charCount: pageObj.text.length,
            };
        });

        return pages;
    } catch (error) {
        console.log(error.message);
        if (error instanceof ClientError) {
            throw error;
        }

        // Otherwise, wrap in AppError
        throw new ClientError(
            `Failed to extract text from PDF: ${error.message}`,
            HTTP.BAD_REQUEST,
        );
    } finally {
        if (parser && typeof parser.destroy === "function")
            await parser.destroy();
    }
};

/*
   @desc    Validates if a file is a valid PDF by checking magic number
   @param   {string} filePath - Path to the file
   @returns {Promise<boolean>}
*/

exports.isValidPDF = async function (filePath) {
    try {
        const buffer = await fs.readFile(filePath, { start: 0, end: 5 });
        const header = buffer.toString("utf-8", 0, 5);
        return header === "%PDF-";
    } catch (error) {
        console.error("❌ PDF validation failed:", error.message);
        return false;
    }
};
