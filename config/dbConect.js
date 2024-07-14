import mongoose from "mongoose";

export const DB_Connect = () => {
    try {
         mongoose.connect(process.env.MONGO_URL);

        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log("Database connected successfully ✔️");
        });

        connection.on("error", (err) => {
            console.error("Database connection error ❌", err);
        });

        connection.on("disconnected", () => {
            console.log("Database disconnected ❌");
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('Database connection terminated due to application termination');
            process.exit(0);
        });

    } catch (error) {
        console.error("Database connection error ❌", error);
    }
};
