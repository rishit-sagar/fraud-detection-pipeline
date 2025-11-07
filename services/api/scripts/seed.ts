import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { connectToDatabase } from '../src/utils/db';
import Transaction from '../src/models/transaction';

(async () => {
  try {
    await connectToDatabase();
    const csvPath = path.resolve(__dirname, '../../../AIML Dataset.csv');
    if (!fs.existsSync(csvPath)) {
      console.error('CSV not found at', csvPath);
      process.exit(1);
    }

    let count = 0;
    const stream = fs.createReadStream(csvPath).pipe(csv());

    for await (const row of stream as any) {
      // Map your CSV columns to model fields here
      // Adjust keys to match actual columns in AIML Dataset.csv
      const transactionId = row.transactionId || row.id || row.txn_id || `${Date.now()}_${Math.random()}`;
      const amount = parseFloat(row.amount || row.Amount || '0');
      const merchant = row.merchant || row.Merchant || 'Unknown';
      const timestamp = new Date(row.timestamp || row.Time || Date.now());
      const riskScore = row.riskScore ? parseFloat(row.riskScore) : Math.random();
      const status = riskScore > 0.7 ? 'flagged' : 'completed';

      await Transaction.updateOne(
        { transactionId },
        {
          $set: {
            transactionId,
            amount,
            merchant,
            timestamp,
            riskScore,
            status
          }
        },
        { upsert: true }
      );
      count++;
      if (count % 100 === 0) console.log(`Upserted ${count} rows...`);
    }

    console.log(`Seed complete. Upserted ${count} transactions.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
