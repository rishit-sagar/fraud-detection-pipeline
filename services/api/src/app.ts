import express from 'express';
import cors from 'cors';
import { setRoutes } from './routes/index';
import { connectToDatabase } from './utils/db';
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuration for frontend
const allowedOrigins = [
  'https://rishit-sagar.github.io',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => allowed && origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

connectToDatabase()
  .then(() => {
    console.log('Connected to MongoDB');
    app.use('/api', setRoutes());
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

export default app;