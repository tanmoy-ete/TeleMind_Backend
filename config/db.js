import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
	try {
		console.log("Connecting to MongoDB URI:", process.env.MONGO_URI);
		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(` MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(` MongoDB Connection Error: ${error.message}`);
		process.exit(1);
	}
};
