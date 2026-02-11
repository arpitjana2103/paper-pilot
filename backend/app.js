const express = require("express");
const qs = require("qs");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const {
    globalErrorHandeller,
    ClientError,
} = require("./services/error.service");

const authRoutes = require("./routes/auth.route");
const doucmentsRoutes = require("./routes/document.route");

const app = express();

// CORS Middleware
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }),
);

// req.cookies parser Middleware
// [ note : Parses cookies from incoming requests into req.cookies ]
app.use(cookieParser());

// req.body parser Middleware
// ‍[ note: Handles and parses incoming "application/json" into req.body ]
app.use(express.json({ limit: "10mb" }));

// req.body parser Middleware
// ‍[ note: Handles and parses incoming "application/x-www-form-urlencoded" into req.body ]
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// req.query parser Middleware
// [ note : parse URL query strings into nested js-objects ]
app.set("query parser", function (str) {
    return qs.parse(str);
});

// [ note : Serve static files from /uploads folder
app.use("/uploads", express.static("uploads"));

// Logger Middleware
// [ note : Logs incoming requests with method, url, and content-type
app.use((req, res, next) => {
    console.log({
        level: "info",
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        contentType: req.headers["content-type"],
        ip: req.ip,
    });
    next();
});

app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server is breathing",
        timestamp: new Date().toISOString(),
    });
});

// Routes Middleware
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/documents", doucmentsRoutes);

// Handellling Unhandled Routes
app.use((req, res, next) => {
    next(new ClientError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handelling Meddleware
app.use(globalErrorHandeller);

module.exports = app;
