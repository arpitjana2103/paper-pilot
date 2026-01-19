const express = require("express");
const qs = require("qs");
const cors = require("cors");
const {
    globalErrorHandeller,
    AppError,
} = require("./controllers/error.controller");

const authRoutes = require("./routes/auth.route");

const app = express();

// req.query parser Middleware
// Set a custom query parser using qs
app.set("query parser", function (str) {
    return qs.parse(str);
});

// req.body parser Middleware :
// ‍[ note : Parses incoming JSON requests into JavaScript objects ]
app.use(express.json());

// [ note : Parse URL-encoded form data into req.body ]
app.use(express.urlencoded({ extended: true }));

// CORS Middleware
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }),
);

// [ note : Serve static files from /uploads folder
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.send("Server is breathing");
});

// Routes Middleware
app.use("/api/v1/auth", authRoutes);

// Handellling Unhandled Routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handelling Meddleware
app.use(globalErrorHandeller);

module.exports = app;

// modules required :
// bcrypt, cors, dotenv, express, express-validator jsonwebtoken mongoose multer pdf-parse @google/genai
