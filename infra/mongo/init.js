db = connect('mongodb://localhost:27017/fraud_detection');

db.createCollection('transactions');
db.transactions.createIndex({ transactionId: 1 }, { unique: true });
db.transactions.createIndex({ userId: 1 });
db.transactions.createIndex({ timestamp: 1 });