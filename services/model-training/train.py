from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import pandas as pd
import joblib

def load_data(file_path):
    data = pd.read_csv(file_path)
    return data

def preprocess_data(data):
    # Example preprocessing steps
    data.fillna(0, inplace=True)
    X = data.drop('is_fraud', axis=1)  # Features
    y = data['is_fraud']  # Target variable
    return X, y

def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred))
    return model

def save_model(model, model_path):
    joblib.dump(model, model_path)

if __name__ == "__main__":
    data = load_data('data/transactions.csv')
    X, y = preprocess_data(data)
    model = train_model(X, y)
    save_model(model, 'models/fraud_detection_model.pkl')