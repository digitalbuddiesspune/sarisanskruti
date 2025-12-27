import { Router } from 'express';
import { createPayUTxn, verifyPayUPayment, verifyPayment, createCODOrder } from '../controllers/payment.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

// PayU transaction creation
router.post('/payu/create', createPayUTxn);

// PayU callback (POST from PayU server, then GET when user is redirected - no auth required)
router.post('/payu/callback', verifyPayUPayment);
router.get('/payu/callback', verifyPayUPayment);

// Legacy verify endpoint (for frontend to check after redirect)
router.post('/verify', auth, verifyPayment);

// COD (Cash on Delivery) order creation
router.post('/cod/create', auth, createCODOrder);

export default router;
