const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app");
const connectDB = require("./configs/mongodb.config");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB("atlas");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🔗 api url : http://127.0.0.1:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
