import { configDotenv } from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport, { setupPassport } from './config/passport.js';

import authRoutes from './routes/auth.routes.js';
import headerRoutes from './routes/header.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import addressRoutes from './routes/address.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import adminRoutes from './routes/admin.routes.js';

import connectDB from './config/DataBaseConnection.js';
import cookieJwtAuth from './middleware/authMiddleware.js';

configDotenv();

console.log(
  'PayU env loaded:',
  Boolean(process.env.PAYU_KEY),
  Boolean(process.env.PAYU_SALT)
);

// Validate critical environment variables in production
if (process.env.NODE_ENV === 'production') {
  const requiredVars = {
    'PAYU_KEY': process.env.PAYU_KEY,
    'PAYU_SALT': process.env.PAYU_SALT,
    'BACKEND_URL': process.env.BACKEND_URL,
    'FRONTEND_URL': process.env.FRONTEND_URL,
  };
  
  const missing = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  if (missing.length > 0) {
    console.warn('⚠️  WARNING: Missing recommended environment variables in production:');
    missing.forEach(key => {
      if (key === 'BACKEND_URL' || key === 'FRONTEND_URL') {
        console.warn(`   - ${key} (will auto-detect from requests, but should be set for reliability)`);
      } else {
        console.error(`   - ${key} (REQUIRED - PayU will not work without this)`);
      }
    });
    if (missing.some(key => key !== 'BACKEND_URL' && key !== 'FRONTEND_URL')) {
      console.error('PayU payments will NOT work without PAYU_KEY and PAYU_SALT!');
    }
  } else {
    console.log('✅ All PayU environment variables are configured');
    console.log('Backend URL:', process.env.BACKEND_URL);
    console.log('Frontend URL:', process.env.FRONTEND_URL);
  }
}

const server = express();

// When behind proxy (Render)
server.set('trust proxy', 1);

// 🚀 **OPEN CORS FOR ALL ORIGINS**
server.use(
  cors({
    origin: true,  // reflects request origin automatically
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

server.use(express.json());
server.use(cookieParser());

// Initialize Passport
setupPassport();
server.use(passport.initialize());

// Health check
server.get('/api/health', (req, res) => res.json({ ok: true }));

// Current user route (cookie + JWT)
server.get('/api/me', cookieJwtAuth, async (req, res) => {
  try {
    // Fetch fresh user data with all required fields
    const User = (await import('./models/User.js')).default;
    const user = await User.findById(req.userId).select('name email phone gender isAdmin googleId avatar provider createdAt updatedAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user in /api/me:', error);
    res.status(500).json({ message: 'Failed to load user data' });
  }
});

// Routes
server.use('/api/auth', authRoutes);
server.use('/api/header', headerRoutes);
server.use('/api/products', productRoutes);
server.use('/api/cart', cartRoutes);
server.use('/api/payment', paymentRoutes);
server.use('/api/address', addressRoutes);
server.use('/api/orders', ordersRoutes);
server.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 7001;

// Connect DB
await connectDB(process.env.MONGODB_URI || '');

// Start server
server.listen(PORT, () => {
  console.log('Server is running at', PORT);
});
