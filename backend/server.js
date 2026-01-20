const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./configs/db.config");
dotenv.config({ path: "./config.env" });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, connectDB);
