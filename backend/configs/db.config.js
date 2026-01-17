const { default: mongoose } = require("mongoose");

const connectDB = function (DB, PORT) {
    return async function () {
        console.log("⌛ connecting to database...");

        try {
            await mongoose.connect(DB);
            console.log("✅ database connecting successfull");
            console.log(`🔗 api url : http://127.0.0.1:${PORT}`);
        } catch (error) {
            console.log("(ノಠ益ಠノ) Database Connection Failed.");
            console.log(error);
        }
    };
};

module.exports = connectDB;
