const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
dotenv.config({ path: "./config.env" });

const DBLOC = process.env.DATABASE_LOCAL;
const PORT = process.env.PORT;

const connectDB = async function () {
    console.log("⌛ connecting to database...");

    try {
        await mongoose.connect(DB);
        console.log("✅ database connecting successfull");
        console.log(`🔗 api url : http://127.0.0.1:${PORT}`);
    } catch (error) {
        console.log("(ノಠ益ಠノ) Database Connection Failed.");
        console.log(error);
        process.exit(1);
    }
};

module.exports = connectDB;
