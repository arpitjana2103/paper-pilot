const app = require("./app");
const connectDB = require("./configs/db.config");

const server = app.listen(PORT, connectDB);
