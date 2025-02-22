import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const connectDb = async () => {
    try {
        const connect = await mongoose.connect(
            `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}@medical-center.ry5xy.mongodb.net/?retryWrites=true&w=majority&appName=medical-center`,
        );
        console.log(`🚀 Connected to MongoDB: ${connect.connection.host}`);
    } catch (error) {
        console.log('Error', error);
    }
};
