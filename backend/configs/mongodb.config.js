const { default: mongoose } = require("mongoose");

const DBLOC = process.env.DATABASE_LOCAL;
const DBATLAS = process.env.DATABASE_ATLAS.replace(
    "<db_password>",
    process.env.ATLAS_PASSWORD,
);

const connectDB = async function (type) {
    console.log("⌛ connecting to database...");

    try {
        const conn = await mongoose.connect(type === "atlas" ? DBATLAS : DBLOC);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📂 Database Name: ${conn.connection.name}`);
    } catch (error) {
        console.log("❌ Database Connection Failed.");
        console.log(error);

        // Graceful shutdown
        await mongoose.connection.close();
        process.exit(0);
    }
};

module.exports = connectDB;
