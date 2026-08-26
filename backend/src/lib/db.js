import mongoose from 'mongoose';


export const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL || "mongodb+srv://0201it231062_db_user:i1OOELX9JaMH5R4A@cluster0.qfw6ovr.mongodb.net/chat_db?appName=Cluster0";
        const conn = await mongoose.connect(mongoUrl);
        console.log(`MongoDB connected :${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
    }
};