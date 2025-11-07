import { Router } from 'express';
import controller from '../controllers/index';

const router = Router();

export const setRoutes = () => {
    // Transactions
    router.post('/transactions', controller.createTransaction);
    router.get('/transactions/:id', controller.getTransaction);
    router.put('/transactions/:id', controller.updateTransaction);
    router.get('/transactions', controller.getAllTransactions);

    // Alerts
    router.get('/alerts', controller.getAlerts);

    // Analyst actions
    router.post('/actions', controller.action);

    return router;
};