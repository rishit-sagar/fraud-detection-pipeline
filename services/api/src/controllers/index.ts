import { Request, Response } from 'express';
import Transaction from '../models/transaction';

class IndexController {
    public async createTransaction(req: Request, res: Response): Promise<void> {
        try {
            const { transactionId, accountId, userId, amount, merchant, riskScore, timestamp, status, reasonCodes } = req.body;
            const tx = await Transaction.create({
                transactionId,
                accountId,
                userId,
                amount,
                merchant,
                riskScore: riskScore ?? 0,
                timestamp: timestamp ? new Date(timestamp) : new Date(),
                status: status ?? 'pending',
                reasonCodes: reasonCodes ?? []
            });
            res.status(201).json(tx);
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Failed to create transaction' });
        }
    }

    public async getTransaction(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const tx = await Transaction.findOne({ transactionId: id });
            if (!tx) {
                res.status(404).json({ error: 'Transaction not found' });
                return;
            }
            res.json(tx);
        } catch (err: any) {
            res.status(500).json({ error: err.message || 'Failed to fetch transaction' });
        }
    }

    public async getAllTransactions(req: Request, res: Response): Promise<void> {
        try {
            const limit = Number(req.query.limit ?? 50);
            const docs = await Transaction.find({}).sort({ timestamp: -1 }).limit(limit);
            res.json(docs);
        } catch (err: any) {
            res.status(500).json({ error: err.message || 'Failed to fetch transactions' });
        }
    }

    public async updateTransaction(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const update = req.body;
            const tx = await Transaction.findOneAndUpdate(
                { transactionId: id },
                { $set: update },
                { new: true }
            );
            if (!tx) {
                res.status(404).json({ error: 'Transaction not found' });
                return;
            }
            res.json(tx);
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Failed to update transaction' });
        }
    }

    public async getAlerts(req: Request, res: Response): Promise<void> {
        try {
            const limit = Number(req.query.limit ?? 50);
            const docs = await Transaction.find({ status: 'flagged' }).sort({ timestamp: -1 }).limit(limit);
            res.json(docs);
        } catch (err: any) {
            res.status(500).json({ error: err.message || 'Failed to fetch alerts' });
        }
    }

    public async action(req: Request, res: Response): Promise<void> {
        try {
            const { transactionId, action, comment } = req.body as { transactionId: string; action: 'approve' | 'block' | 'escalate'; comment?: string };
            const statusMap: Record<string, string> = { approve: 'approved', block: 'blocked', escalate: 'escalated' };
            const newStatus = statusMap[action] ?? 'approved';
            const tx = await Transaction.findOneAndUpdate(
                { transactionId },
                { $set: { status: newStatus }, $push: { reasonCodes: comment ?? `analyst:${action}` } },
                { new: true }
            );
            if (!tx) {
                res.status(404).json({ error: 'Transaction not found' });
                return;
            }
            res.json({ ok: true, transaction: tx });
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Failed to perform action' });
        }
    }
}

export default new IndexController();