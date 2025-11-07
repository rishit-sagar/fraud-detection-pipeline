export const extractTransactionFeatures = (transaction) => {
    const features = {};

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

const calculateRollingAverage = (userId) => {
    // Placeholder for rolling average calculation logic
    return 0; // Replace with actual calculation
};

const checkGeoConsistency = (transaction) => {
    // Placeholder for geo consistency check logic
    return true; // Replace with actual check
};