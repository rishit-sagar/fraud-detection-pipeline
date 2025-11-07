import mongoose, { Schema } from 'mongoose';

const transactionSchema: Schema = new Schema({
    transactionId: { type: String, required: true, unique: true },
    accountId: { type: String },
    userId: { type: String },
    amount: { type: Number, required: true },
    merchant: { type: String },
    riskScore: { type: Number, default: 0 },
    reasonCodes: { type: [String], default: [] },
    timestamp: { type: Date, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ['pending', 'completed', 'failed', 'flagged', 'approved', 'blocked', 'escalated'],
        default: 'pending'
    }
}, { timestamps: true });

// Note: Indexes removed temporarily to avoid TypeScript union complexity errors during build.
// Consider adding these indexes directly in MongoDB or revisiting typings when upgrading toolchain.

const Transaction = mongoose.model('Transaction', transactionSchema as any);

export default Transaction;