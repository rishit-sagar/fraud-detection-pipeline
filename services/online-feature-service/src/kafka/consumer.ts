import { Kafka } from 'kafkajs';
import { extractFeatures } from '../features/transactionFeatures';

const kafka = new Kafka({
  clientId: 'fraud-detection',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'fraud-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'transactions', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const transaction = JSON.parse(message.value.toString());
      const features = extractFeatures(transaction);
      // Process features (e.g., send to a database or another service)
      console.log('Extracted features:', features);
    },
  });
};

run().catch(console.error);