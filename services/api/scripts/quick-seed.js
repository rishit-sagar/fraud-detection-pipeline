const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://sagarrishit_db_user:Hello%4073@cluster0.9wy4bgi.mongodb.net/fraud_detection?retryWrites=true&w=majority';

const transactionSchema = new mongoose.Schema({
  transactionId: String,
  accountId: String,
  amount: Number,
  merchant: String,
  riskScore: Number,
  reasonCodes: [String],
  timestamp: Date,
  status: String
});

const Transaction = mongoose.model('Transaction', transactionSchema);

const sampleTransactions = [
  { transactionId: 'TXN001', accountId: 'ACC123', amount: 2500.00, merchant: 'Unknown Vendor XYZ', riskScore: 0.92, status: 'flagged', timestamp: new Date(), reasonCodes: ['high_amount', 'new_merchant'] },
  { transactionId: 'TXN002', accountId: 'ACC124', amount: 1250.50, merchant: 'Electronics Store', riskScore: 0.85, status: 'flagged', timestamp: new Date(), reasonCodes: ['velocity_check', 'geo_mismatch'] },
  { transactionId: 'TXN003', accountId: 'ACC125', amount: 3200.00, merchant: 'Overseas Transfer', riskScore: 0.95, status: 'flagged', timestamp: new Date(), reasonCodes: ['international', 'high_risk'] },
  { transactionId: 'TXN004', accountId: 'ACC126', amount: 45.99, merchant: 'Coffee Shop', riskScore: 0.12, status: 'approved', timestamp: new Date(), reasonCodes: [] },
  { transactionId: 'TXN005', accountId: 'ACC127', amount: 89.50, merchant: 'Gas Station', riskScore: 0.15, status: 'approved', timestamp: new Date(), reasonCodes: [] },
  { transactionId: 'TXN006', accountId: 'ACC128', amount: 5500.00, merchant: 'Luxury Goods Inc', riskScore: 0.88, status: 'flagged', timestamp: new Date(), reasonCodes: ['high_amount', 'unusual_category'] },
  { transactionId: 'TXN007', accountId: 'ACC129', amount: 125.00, merchant: 'Restaurant', riskScore: 0.18, status: 'completed', timestamp: new Date(), reasonCodes: [] },
  { transactionId: 'TXN008', accountId: 'ACC130', amount: 1800.00, merchant: 'Online Marketplace', riskScore: 0.78, status: 'flagged', timestamp: new Date(), reasonCodes: ['new_device', 'high_amount'] },
];

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('Connected successfully');

    console.log('Seeding transactions...');
    for (const tx of sampleTransactions) {
      await Transaction.updateOne(
        { transactionId: tx.transactionId },
        { $set: tx },
        { upsert: true }
      );
      console.log(`Upserted ${tx.transactionId}`);
    }

    console.log(`\nSeeded ${sampleTransactions.length} transactions successfully!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();
