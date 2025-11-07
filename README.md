# 🛡️ Real-Time Fraud Detection Pipeline

A complete MERN stack fraud detection system with streaming ingestion, ML-based risk scoring, and an analyst review console.

## 🌐 **LIVE DEMO**

**✨ Analyst Console:** https://rishit-sagar.github.io/fraud-detection-pipeline/

**📦 GitHub Repository:** https://github.com/rishit-sagar/fraud-detection-pipeline

The frontend is live with demo data. For full backend integration, see deployment guide below.

## Project Structure

```
fraud-detection-pipeline
├── services
│   ├── api                  # API service for handling transaction data
│   ├── online-feature-service # Service for online feature extraction
│   ├── model-training       # Service for training machine learning models
│   └── kafka                # Kafka configuration and connectors
├── frontend
│   └── console              # React console for analysts
├── infra                    # Infrastructure setup (MongoDB, Docker)
├── scripts                  # Scripts for automation
├── .gitignore               # Git ignore file
└── README.md                # Project documentation
```

## Features

- **Real-time Transaction Monitoring**: The pipeline ingests transaction data in real-time using Kafka.
- **Feature Extraction**: Online feature extraction service processes incoming transactions to generate relevant features for fraud detection.
- **Machine Learning Model**: A trained model that predicts fraudulent transactions based on historical data.
- **Analyst Console**: A React-based console for analysts to review flagged transactions and take necessary actions.

## Setup Instructions

1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd fraud-detection-pipeline
   ```

2. **Install Dependencies**:
   - For the API service:
     ```
     cd services/api
     npm install
     ```
   - For the online feature extraction service:
     ```
     cd ../online-feature-service
     npm install
     ```
   - For the frontend console:
     ```
     cd ../../frontend/console
     npm install
     ```

3. **Configure Environment Variables**:
   - Copy the `.env.example` file in the `services/api` directory to `.env` and update the database connection string and other configurations as needed.

4. **Start Services**:
   - Use the provided script to start all services:
     ```
     cd ../scripts
     ./start-all.sh
     ```

5. **Access the Analyst Console**:
   - Open your browser and navigate to `http://localhost:3000` to access the React console.

## Aesthetic Design

The frontend console is designed with a monotonous color palette to ensure a clean and professional look, enhancing the user experience for analysts.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.