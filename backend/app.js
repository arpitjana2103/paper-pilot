const express = require("express");
const qs = require("qs");

const app = express();

// req.query parser Middleware
// Set a custom query parser using qs
app.set("query parser", function (str) {
    return qs.parse(str);
});

// req.body parser Middleware :
// ‍[ note : Parses incoming JSON requests into JavaScript objects ]
app.use(express.json());

// The missing piece
app.get("/", (req, res) => {
    res.send("Server is breathing");
});

module.exports = app;

// modules required :
// bcrypt, cors, dotenv, express, express-validator jsonwebtoken mongoose multer pdf-parse @google/genai
