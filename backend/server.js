const dotenv = require("dotenv");
const app = require("./app");
const { default: mongoose } = require("mongoose");
const connectDB = require("./configs/db.config");

dotenv.config({ path: "./config.env" });

const DBLOC = process.env.DATABASE_LOCAL;
const PORT = process.env.PORT;

const server = app.listen(PORT, connectDB(DBLOC, PORT));
