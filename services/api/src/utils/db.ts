import mongoose from 'mongoose';

export const connectToDatabase = async () => {
    try {
        const uri = process.env.MONGO_URL || process.env.MONGO_URI || 'mongodb://localhost:27017/fraud_detection';
        await mongoose.connect(uri as any);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('MongoDB disconnected successfully');
    } catch (error) {
        console.error('MongoDB disconnection failed:', error);
    }
};