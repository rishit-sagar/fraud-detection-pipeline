interface Transaction {
    amount: number;
    timestamp: string | Date;
    userId: string;
    [key: string]: any;
}

interface Features {
    amount: number;
    timestamp: number;
    rollingAverage: number;
    geoConsistency: boolean;
}

export const extractTransactionFeatures = (transaction: Transaction): Features => {
    const features: Features = {
        amount: 0,
        timestamp: 0,
        rollingAverage: 0,
        geoConsistency: false
    };

    // Example feature: transaction amount
    features.amount = transaction.amount;

    // Example feature: transaction time (could be converted to a timestamp)
    features.timestamp = new Date(transaction.timestamp).getTime();

    // Example feature: rolling window calculations (dummy implementation)
    features.rollingAverage = calculateRollingAverage(transaction.userId);

    // Example feature: geo/device consistency checks (dummy implementation)
    features.geoConsistency = checkGeoConsistency(transaction);

    return features;
};

const calculateRollingAverage = (userId: string): number => {
    // Placeholder for rolling average calculation logic
    return 0; // Replace with actual calculation
};

const checkGeoConsistency = (transaction: Transaction): boolean => {
    // Placeholder for geo consistency check logic
    return true; // Replace with actual check
};