const dotenv = require("dotenv");
const app = require("./app");
const { default: mongoose } = require("mongoose");

dotenv.config({ path: "./config.env" });

const DBLOC = process.env.DATABASE_LOCAL;
const PORT = process.env.PORT;

const server = app.listen(PORT, function () {
    console.log("⌛ connecting to database...");

    mongoose
        .connect(DBLOC)
        .then(function () {
            console.log("✅ database connecting successfull");
            console.log(`🔗 api url : http://127.0.0.1:${PORT}`);
        })
        .catch(function (err) {
            console.log("(ノಠ益ಠノ) Database Connection Failed.");
            console.log(err);
        });
});
