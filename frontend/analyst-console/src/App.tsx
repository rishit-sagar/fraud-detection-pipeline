import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import ApiService from './services/api';

interface Transaction {
  transactionId: string;
  accountId?: string;
  userId?: string;
  amount: number;
  merchant: string;
  status: string;
  riskScore: number;
  timestamp: string;
  reasonCodes: string[];
}

type NewTransactionForm = {
  transactionId: string;
  accountId: string;
  userId: string;
  amount: string;
  merchant: string;
  riskScore: string;
  status: string;
  timestamp: string;
  reasonCodes: string;
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [newTransaction, setNewTransaction] = useState<NewTransactionForm>({
    transactionId: '',
    accountId: '',
    userId: '',
    amount: '',
    merchant: '',
    riskScore: '',
    status: 'pending',
    timestamp: '',
    reasonCodes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const checkApiHealth = useCallback(async () => {
    try {
      await ApiService.checkHealth();
      setApiStatus('online');
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus('offline');
    }
  }, []);

  const createFallbackId = useCallback(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }, []);

  const resetForm = useCallback(() => {
    setNewTransaction({
      transactionId: createFallbackId(),
      accountId: '',
      userId: '',
      amount: '',
      merchant: '',
      riskScore: '',
      status: 'pending',
      timestamp: '',
      reasonCodes: '',
    });
  }, [createFallbackId]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const normalizeTransaction = useCallback((txn: any): Transaction => ({
    transactionId: txn.transactionId || txn.id || txn._id || createFallbackId(),
    accountId: txn.accountId || '',
    userId: txn.userId || '',
    amount: Number(txn.amount) || 0,
    merchant: txn.merchant || 'Unknown merchant',
    status: txn.status || 'pending',
    riskScore:
      typeof txn.riskScore === 'number'
        ? txn.riskScore
        : Number.isFinite(Number(txn.riskScore))
        ? Number(txn.riskScore)
        : 0,
    timestamp: txn.timestamp || txn.createdAt || new Date().toISOString(),
    reasonCodes: Array.isArray(txn.reasonCodes)
      ? txn.reasonCodes
      : typeof txn.reasonCodes === 'string' && txn.reasonCodes.trim().length > 0
      ? txn.reasonCodes
          .split(',')
          .map((code: string) => code.trim())
          .filter(Boolean)
      : [],
  }), [createFallbackId]);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await ApiService.getTransactions();
      const normalized = Array.isArray(data)
        ? data.map((txn: any) => normalizeTransaction(txn))
        : [];
      setTransactions(normalized);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      // Load mock data for demo
      setTransactions([
        { transactionId: 'TX-DEMO-1', amount: 1250.0, merchant: 'Tech Store', status: 'flagged', riskScore: 0.85, timestamp: new Date().toISOString(), reasonCodes: ['device_mismatch'] },
        { transactionId: 'TX-DEMO-2', amount: 45.99, merchant: 'Coffee Shop', status: 'approved', riskScore: 0.12, timestamp: new Date().toISOString(), reasonCodes: [] },
        { transactionId: 'TX-DEMO-3', amount: 2500.0, merchant: 'Unknown Vendor', status: 'flagged', riskScore: 0.92, timestamp: new Date().toISOString(), reasonCodes: ['high_amount'] },
      ]);
    } finally {
      setLoading(false);
    }
  }, [createFallbackId]);

  useEffect(() => {
    checkApiHealth();
    loadTransactions();
  }, [checkApiHealth, loadTransactions]);

  const handleAction = async (txnId: string, action: string) => {
    try {
      await ApiService.performAction(txnId, action, `Action: ${action}`);
      loadTransactions();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const handleNewTransactionChange = (
    field: keyof NewTransactionForm
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value } = event.target;
    setNewTransaction(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setFormMessage(null);

    const trimmedTransactionId = (newTransaction.transactionId || '').trim() || createFallbackId();
    const parsedAmount = Number(newTransaction.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormMessage({ type: 'error', text: 'Enter a valid transaction amount greater than 0.' });
      return;
    }

    const parsedRisk = newTransaction.riskScore === '' ? 0 : Number(newTransaction.riskScore);
    if (!Number.isFinite(parsedRisk) || parsedRisk < 0 || parsedRisk > 1) {
      setFormMessage({ type: 'error', text: 'Risk score must be a number between 0 and 1.' });
      return;
    }

    const timestampValue = newTransaction.timestamp?.trim();
    if (timestampValue && Number.isNaN(Date.parse(timestampValue))) {
      setFormMessage({ type: 'error', text: 'Timestamp must be a valid date/time.' });
      return;
    }

    const payload = {
      transactionId: trimmedTransactionId,
      accountId: newTransaction.accountId.trim() || undefined,
      userId: newTransaction.userId.trim() || undefined,
      amount: parsedAmount,
      merchant: newTransaction.merchant.trim() || 'Manual entry',
      riskScore: parsedRisk,
      status: newTransaction.status || 'pending',
      timestamp: timestampValue ? new Date(timestampValue).toISOString() : undefined,
      reasonCodes: newTransaction.reasonCodes
        .split(',')
        .map(code => code.trim())
        .filter(Boolean),
    };

    setSubmitting(true);
    try {
      const created = await ApiService.createTransaction(payload);
      setTransactions(prev => [normalizeTransaction(created), ...prev]);
      setFormMessage({ type: 'success', text: 'Transaction saved and added to the queue.' });
      resetForm();
      if (apiStatus !== 'online') {
        checkApiHealth();
      }
    } catch (error: any) {
      console.error('Failed to create transaction:', error);
      setFormMessage({
        type: 'error',
        text: error?.message || 'Failed to create transaction. Check API logs for details.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 0.7) return '#e74c3c';
    if (score > 0.4) return '#f39c12';
    return '#27ae60';
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🛡️ Fraud Detection Analyst Console</h1>
        <div className={`status-indicator ${apiStatus}`}>
          API: {apiStatus === 'online' ? '🟢 Online' : apiStatus === 'offline' ? '🔴 Offline' : '🟡 Checking...'}
        </div>
      </header>

      <main className="main-content">
        <div className="create-transaction-card">
          <div className="create-transaction-header">
            <h2>Manual Transaction Entry</h2>
            <button
              type="button"
              className="reset-btn"
              onClick={() => {
                resetForm();
                setFormMessage(null);
              }}
              disabled={submitting}
            >
              Reset
            </button>
          </div>
          <form className="create-transaction-form" onSubmit={handleCreateTransaction}>
            <label>
              <span>Transaction ID</span>
              <input
                type="text"
                value={newTransaction.transactionId}
                onChange={handleNewTransactionChange('transactionId')}
                placeholder="Auto-generated if left blank"
              />
            </label>
            <label>
              <span>Account ID</span>
              <input
                type="text"
                value={newTransaction.accountId}
                onChange={handleNewTransactionChange('accountId')}
                placeholder="Optional"
              />
            </label>
            <label>
              <span>User ID</span>
              <input
                type="text"
                value={newTransaction.userId}
                onChange={handleNewTransactionChange('userId')}
                placeholder="Optional"
              />
            </label>
            <label>
              <span>Merchant</span>
              <input
                type="text"
                value={newTransaction.merchant}
                onChange={handleNewTransactionChange('merchant')}
                placeholder="Merchant name"
                required
              />
            </label>
            <label>
              <span>Amount (USD)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newTransaction.amount}
                onChange={handleNewTransactionChange('amount')}
                placeholder="0.00"
                required
              />
            </label>
            <label>
              <span>Risk Score (0-1)</span>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={newTransaction.riskScore}
                onChange={handleNewTransactionChange('riskScore')}
                placeholder="0.50"
              />
            </label>
            <label>
              <span>Status</span>
              <select value={newTransaction.status} onChange={handleNewTransactionChange('status')}>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
                <option value="approved">Approved</option>
                <option value="blocked">Blocked</option>
                <option value="escalated">Escalated</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </label>
            <label>
              <span>Timestamp</span>
              <input
                type="datetime-local"
                value={newTransaction.timestamp}
                onChange={handleNewTransactionChange('timestamp')}
              />
            </label>
            <label className="reason-input">
              <span>Reason Codes (comma separated)</span>
              <input
                type="text"
                value={newTransaction.reasonCodes}
                onChange={handleNewTransactionChange('reasonCodes')}
                placeholder="device_mismatch, high_amount"
              />
            </label>
            <div className="form-footer">
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Create Transaction'}
              </button>
            </div>
          </form>
          {formMessage && (
            <div className={`form-message ${formMessage.type}`}>
              {formMessage.text}
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : (
          <div className="transactions-grid">
            <h2>Flagged Transactions</h2>
            {transactions.filter(t => t.status === 'flagged').map(txn => (
              <div key={txn.transactionId} className="transaction-card flagged">
                <div className="card-header">
                  <span className="merchant">{txn.merchant}</span>
                  <span className="amount">${txn.amount.toFixed(2)}</span>
                </div>
                <div className="meta-row">
                  {txn.accountId && <span>Acct: {txn.accountId}</span>}
                  {txn.userId && <span>User: {txn.userId}</span>}
                </div>
                <div className="risk-score" style={{ color: getRiskColor(txn.riskScore) }}>
                  Risk Score: {(txn.riskScore * 100).toFixed(0)}%
                </div>
                <div className="timestamp">{new Date(txn.timestamp).toLocaleString()}</div>
                {txn.reasonCodes.length > 0 && (
                  <div className="reason-codes">
                    Reasons: {txn.reasonCodes.join(', ')}
                  </div>
                )}
                <div className="actions">
                  <button className="approve-btn" onClick={() => handleAction(txn.transactionId, 'approve')}>
                    ✓ Approve
                  </button>
                  <button className="block-btn" onClick={() => handleAction(txn.transactionId, 'block')}>
                    ✕ Block
                  </button>
                  <button className="escalate-btn" onClick={() => handleAction(txn.transactionId, 'escalate')}>
                    ⚠ Escalate
                  </button>
                </div>
              </div>
            ))}

            <h2>Recent Activity</h2>
            {transactions.filter(t => t.status !== 'flagged').map(txn => (
              <div key={txn.transactionId} className="transaction-card">
                <div className="card-header">
                  <span className="merchant">{txn.merchant}</span>
                  <span className="amount">${txn.amount.toFixed(2)}</span>
                </div>
                <div className="meta-row">
                  {txn.accountId && <span>Acct: {txn.accountId}</span>}
                  {txn.userId && <span>User: {txn.userId}</span>}
                </div>
                <div className="risk-score" style={{ color: getRiskColor(txn.riskScore) }}>
                  Risk Score: {(txn.riskScore * 100).toFixed(0)}%
                </div>
                <div className="timestamp">{new Date(txn.timestamp).toLocaleString()}</div>
                <div className="status-badge">{txn.status}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
