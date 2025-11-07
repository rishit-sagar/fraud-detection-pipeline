import { API_CONFIG, ENDPOINTS } from '../config';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  async get(endpoint: string) {
    const url = `${this.baseURL}${endpoint}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error(`GET request to ${url} failed:`, error);
      throw error;
    }
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async getTransactions() {
    return this.get(ENDPOINTS.transactions);
  }

  async getAlerts() {
    return this.get(ENDPOINTS.alerts);
  }

  async performAction(transactionId: string, action: string, comment: string) {
    return this.post(ENDPOINTS.actions, { transactionId, action, comment });
  }

  async createTransaction(payload: any) {
    return this.post(ENDPOINTS.transactions, payload);
  }

  async checkHealth() {
    return this.get(ENDPOINTS.health);
  }
}

const apiService = new ApiService();

export default apiService;
