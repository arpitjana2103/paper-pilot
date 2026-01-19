const app = require("./app");
const connectDB = require("./configs/db.config");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, connectDB);
