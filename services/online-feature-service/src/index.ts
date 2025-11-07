import express from 'express';
import { Kafka } from 'kafkajs';
import { extractTransactionFeatures } from './features/transactionFeatures';
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const kafka = new Kafka({
  clientId: 'online-feature-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  ssl: process.env.KAFKA_SSL === 'true',
  sasl: process.env.KAFKA_USERNAME ? {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD || ''
  } : undefined
});

const consumer = kafka.consumer({ groupId: 'feature-extraction-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TRANSACTIONS_TOPIC || 'transactions', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        if (!message.value) return;
        const transactionData = JSON.parse(message.value.toString());
        const features = extractTransactionFeatures(transactionData);
        console.log('Extracted Features:', features);
        // TODO: persist features or publish to another topic
      } catch (err) {
        console.error('Feature extraction error:', err);
      }
    },
  });
};

app.listen(PORT, () => {
  console.log(`Online Feature Extraction Service is running on port ${PORT}`);
  run().catch(console.error);
});