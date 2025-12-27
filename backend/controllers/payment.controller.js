import crypto from 'crypto';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import { Address } from '../models/Address.js';

// In-memory cache to prevent duplicate payment requests (TTL: 60 seconds)
const paymentRequestCache = new Map();
const PAYMENT_REQUEST_TTL = 60 * 1000; // 60 seconds

// Helper to check and prevent duplicate requests
const checkDuplicateRequest = (userId, amount, email) => {
  // Create cache key from user identifier and amount
  const cacheKey = `${userId || email}_${amount}`;
  
  // Check if there's a recent request for this user+amount
  const cached = paymentRequestCache.get(cacheKey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < PAYMENT_REQUEST_TTL) {
    console.warn('⚠️  Duplicate request detected in cache:', {
      cacheKey,
      timeSinceLastRequest: now - cached.timestamp,
      ttl: PAYMENT_REQUEST_TTL
    });
    return true; // Duplicate request detected
  }
  
  // Store this request with current timestamp
  paymentRequestCache.set(cacheKey, { timestamp: now, userId, email, amount });
  
  // Clean up old entries (older than TTL) periodically
  // Only clean up every 10th request to avoid performance impact
  if (Math.random() < 0.1) {
    for (const [key, value] of paymentRequestCache.entries()) {
      if (now - value.timestamp > PAYMENT_REQUEST_TTL) {
        paymentRequestCache.delete(key);
      }
    }
  }
  
  return false; // Not a duplicate
};

// PayU transaction creation
export const createPayUTxn = async (req, res) => {
  try {
    const { amount, name, email, phone } = req.body;
    
    // Prevent duplicate payment requests (rate limiting protection)
    const requestUserId = req.userId || null;
    const isDuplicate = checkDuplicateRequest(requestUserId, amount, email);
    if (isDuplicate) {
      console.warn('⚠️  Duplicate payment request detected:', { userId: requestUserId, email, amount });
      return res.status(429).json({ 
        error: 'Too many requests. Please wait a moment before trying again.',
        retryAfter: 60
      });
    }
    
    // Validate required fields with detailed error messages
    const missingFields = [];
    if (!amount && amount !== 0) missingFields.push('amount');
    if (!name || !name.trim()) missingFields.push('name');
    if (!email || !email.trim()) missingFields.push('email');
    if (!phone || !phone.trim()) missingFields.push('phone');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}`,
        received: { amount, name, email, phone }
      });
    }

    const rupees = Number(amount);
    if (!rupees || Number.isNaN(rupees) || rupees <= 0) {
      return res.status(400).json({ error: `Invalid amount: ${amount}` });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate phone (should be 10 digits for Indian numbers)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({ error: 'Phone number must be 10 digits' });
    }

    const key = process.env.PAYU_KEY;
    let salt = process.env.PAYU_SALT;

    if (!key || !salt) {
      return res.status(500).json({ error: 'PayU keys not configured on server' });
    }

    // Validate and fix SALT value (common typo: lowercase 'l' vs capital 'I')
    // PayU test SALT should end with 'KI3jCjk0' (capital I), not 'Kl3jCjk0' (lowercase l)
    if (salt.includes('Kl3jCjk0')) {
      console.warn('⚠️  WARNING: SALT value has lowercase "l" - should be capital "I"');
      console.warn('⚠️  Current SALT:', salt);
      console.warn('⚠️  Expected SALT should end with: KI3jCjk0 (capital I)');
      salt = salt.replace('Kl3jCjk0', 'KI3jCjk0');
      console.warn('⚠️  Auto-corrected SALT to:', salt);
    }

    // Generate unique transaction ID with timestamp and random component
    // This ensures even rapid requests get unique txnids
    const txnid = 'txn' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const productinfo = 'Order';

    // PayU hash string format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    // Exactly 11 pipes between email and SALT
    // Ensure amount is string (no decimal conversion) and trim all values
    const amountStr = String(amount).trim();
    const firstname = name.trim();
    const emailTrimmed = email.trim();
    
    // Build hash string exactly as PayU requires
    const hashString = `${key}|${txnid}|${amountStr}|${productinfo}|${firstname}|${emailTrimmed}|||||||||||${salt}`;
    
    // Debug logging (remove in production)
    console.log('PayU Hash Debug:', {
      key,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email: emailTrimmed,
      salt,
      hashStringLength: hashString.length,
      pipesAfterEmail: (hashString.match(/\|/g) || []).length - 5
    });
    
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    // Backend callback URLs (PayU sends POST here first, then redirects user via GET)
    // For production, BACKEND_URL MUST be set to your live backend URL
    let BACKEND_URL = process.env.BACKEND_URL;
    
    // Auto-detect from request if not set (fallback for quick fix)
    if (!BACKEND_URL && process.env.NODE_ENV === 'production') {
      const protocol = req.protocol || (req.secure ? 'https' : 'http');
      const host = req.get('host') || req.headers.host;
      if (host) {
        BACKEND_URL = `${protocol}://${host}`;
        console.warn('⚠️  WARNING: BACKEND_URL not set, auto-detected from request:', BACKEND_URL);
        console.warn('⚠️  Please set BACKEND_URL environment variable in Render for reliability!');
      } else {
        console.error('❌ CRITICAL: BACKEND_URL environment variable is not set and cannot be auto-detected!');
        console.error('Please set BACKEND_URL in your Render environment variables.');
        return res.status(500).json({ 
          error: 'Server configuration error: BACKEND_URL not set',
          details: 'Please set BACKEND_URL environment variable in Render dashboard'
        });
      }
    }
    
    const backendUrl = BACKEND_URL || `http://localhost:${process.env.PORT || 7001}`;
    // Support both PAYU_CALLBACK_URL (legacy) and PAYU_CALLBACK_SUCCESS_URL/PAYU_CALLBACK_FAIL_URL
    const callbackSuccessUrl = process.env.PAYU_CALLBACK_SUCCESS_URL || 
      process.env.PAYU_CALLBACK_URL || 
      `${backendUrl}/api/payment/payu/callback?status=success`;
    const callbackFailUrl = process.env.PAYU_CALLBACK_FAIL_URL || 
      process.env.PAYU_CALLBACK_URL || 
      `${backendUrl}/api/payment/payu/callback?status=fail`;

    // Frontend redirect URLs (where user is redirected after backend processes POST)
    // For production, FRONTEND_URL MUST be set to your live frontend URL
    let FRONTEND_URL = process.env.FRONTEND_URL;
    
    if (!FRONTEND_URL && process.env.NODE_ENV === 'production') {
      // Try to get from request origin (frontend making the request)
      const origin = req.headers.origin;
      if (origin && (origin.includes('vercel.app') || origin.includes('onrender.com') || origin.includes('netlify.app'))) {
        FRONTEND_URL = origin;
        console.warn('⚠️  WARNING: FRONTEND_URL not set, using request origin:', FRONTEND_URL);
        console.warn('⚠️  Please set FRONTEND_URL environment variable in Render for reliability!');
      } else {
        console.error('❌ CRITICAL: FRONTEND_URL environment variable is not set and cannot be auto-detected!');
        console.error('Please set FRONTEND_URL in your Render environment variables.');
        return res.status(500).json({ 
          error: 'Server configuration error: FRONTEND_URL not set',
          details: 'Please set FRONTEND_URL environment variable in Render dashboard'
        });
      }
    }
    
    const frontendUrl = FRONTEND_URL || 'http://localhost:5174';
    const frontendSuccessUrl = process.env.PAYU_SUCCESS_URL || `${frontendUrl}/payment-success`;
    const frontendFailUrl = process.env.PAYU_FAIL_URL || `${frontendUrl}/payment-fail`;
    
    // Log URLs for debugging (remove sensitive data in production)
    console.log('PayU URLs configured:', {
      backendUrl: backendUrl.replace(/\/\/.*@/, '//***@'), // Hide credentials if any
      frontendUrl,
      callbackSuccessUrl: callbackSuccessUrl.replace(/\/\/.*@/, '//***@'),
      callbackFailUrl: callbackFailUrl.replace(/\/\/.*@/, '//***@'),
    });

    // Store txnid -> userId mapping if userId is available (from optional auth)
    // This helps us find the user during callback when PayU sends POST
    const userId = req.userId || null;
    if (userId) {
      // Store mapping in a simple in-memory cache or you could use Redis/DB
      // For now, we'll rely on email lookup in callback, but this could be improved
      console.log('PayU transaction created for userId:', userId, 'txnid:', txnid);
    }

    return res.json({
      key,
      txnid,
      amount,
      productinfo,
      firstname: name,
      email,
      phone,
      hash,
      // PayU surl/furl receive POST callbacks, then redirect user via GET
      // Set to backend callback URLs - backend will handle POST and redirect to frontend
      surl: callbackSuccessUrl,
      furl: callbackFailUrl,
      // Store frontend URLs for redirect after POST processing
      frontendSuccessUrl,
      frontendFailUrl,
    });
  } catch (err) {
    console.error('createPayUTxn err', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// PayU payment verification (called by PayU via POST on success/failure, then user redirected via GET)
// This endpoint handles both POST (PayU server callback) and GET (user browser redirect)
export const verifyPayUPayment = async (req, res) => {
  try {
    // Get data from POST body (PayU server callback) or query params (user redirect)
    const isPost = req.method === 'POST';
    const dataSource = isPost ? req.body : req.query;
    
    const {
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      hash,
      key,
      // Additional PayU response fields
      mihpayid,
      bank_ref_num,
      error,
      error_Message,
    } = dataSource;

    // Frontend redirect URLs
    // For production, FRONTEND_URL MUST be set to your live frontend URL
    let FRONTEND_URL = process.env.FRONTEND_URL;
    
    if (!FRONTEND_URL && process.env.NODE_ENV === 'production') {
      // Try to get from request origin or referer
      const origin = req.headers.origin || req.headers.referer;
      if (origin) {
        try {
          const url = new URL(origin);
          FRONTEND_URL = `${url.protocol}//${url.host}`;
          console.warn('⚠️  WARNING: FRONTEND_URL not set, using request origin:', FRONTEND_URL);
        } catch {
          // Invalid URL, use fallback
        }
      }
      
      if (!FRONTEND_URL) {
        console.error('❌ CRITICAL: FRONTEND_URL environment variable is not set and cannot be auto-detected!');
        const frontendFailUrl = 'http://localhost:5174/payment-fail'; // Fallback
        const params = new URLSearchParams({
          error: 'Server configuration error',
          status: 'failed'
        });
        return res.redirect(`${frontendFailUrl}?${params.toString()}`);
      }
    }
    
    const frontendUrl = FRONTEND_URL || 'http://localhost:5174';
    const frontendSuccessUrl = process.env.PAYU_SUCCESS_URL || `${frontendUrl}/payment-success`;
    const frontendFailUrl = process.env.PAYU_FAIL_URL || `${frontendUrl}/payment-fail`;

    // If GET request without required data, redirect to fail page
    if (!isPost && (!txnid || !status)) {
      console.warn('PayU callback: GET request without required data, redirecting to fail');
      const params = new URLSearchParams({
        error: 'Invalid callback data',
        status: 'failed'
      });
      return res.redirect(`${frontendFailUrl}?${params.toString()}`);
    }

    // For POST requests (PayU server callback), verify and process payment
    if (isPost) {
      if (!txnid || !amount || !hash) {
        console.error('PayU POST callback: Missing required fields');
        // Still redirect user to fail page
        const params = new URLSearchParams({
          error: 'Missing required fields',
          status: 'failed',
          txnid: txnid || ''
        });
        return res.redirect(`${frontendFailUrl}?${params.toString()}`);
      }

      const salt = process.env.PAYU_SALT;
      const payuKey = process.env.PAYU_KEY;

      if (!salt || !payuKey) {
        console.error('PayU POST callback: Server secret missing');
        const params = new URLSearchParams({
          error: 'Server configuration error',
          status: 'failed',
          txnid: txnid || ''
        });
        return res.redirect(`${frontendFailUrl}?${params.toString()}`);
      }

      // Verify hash: key|txnid|amount|productinfo|firstname|email|status|||||||||||salt
      const hashString = `${payuKey}|${txnid}|${amount}|${productinfo || ''}|${firstname || ''}|${email || ''}|${status}|||||||||||${salt}`;
      const expectedHash = crypto.createHash('sha512').update(hashString).digest('hex');

      if (expectedHash !== hash) {
        console.error('PayU hash verification failed', {
          txnid,
          expectedHash: expectedHash.substring(0, 20) + '...',
          receivedHash: hash ? hash.substring(0, 20) + '...' : 'missing'
        });
        const params = new URLSearchParams({
          error: 'Invalid hash verification',
          status: 'failed',
          txnid: txnid || ''
        });
        return res.redirect(`${frontendFailUrl}?${params.toString()}`);
      }

      // Hash verified - payment is legitimate
      const isSuccess = status === 'success';

      if (isSuccess) {
        // Try to find user by email (PayU provides email in callback)
        // We need to find the user who initiated this transaction
        // Option 1: Store txnid -> userId mapping before redirect (better approach)
        // Option 2: Find user by email (less reliable if multiple users have same email)
        // For now, we'll try to find user by email and create order if found
        try {
          const User = (await import('../models/User.js')).default;
          const user = await User.findOne({ email: email?.trim() });
          
          if (user) {
            const userId = String(user._id);
            
            // Create order from cart items
            const cart = await Cart.findOne({ user: userId }).populate('items.product');
            if (cart && Array.isArray(cart.items) && cart.items.length > 0) {
              const items = cart.items.map(i => {
                const p = i.product;
                let base = 0;
                if (p && typeof p.price === 'number') {
                  base = Number(p.price) || 0;
                } else {
                  const mrp = Number(p?.mrp) || 0;
                  const discountPercent = Number(p?.discountPercent) || 0;
                  base = Math.round(mrp - (mrp * discountPercent) / 100) || 0;
                }
                return { product: p._id, quantity: i.quantity, price: base };
              });
              const orderAmount = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);

              // Load user's current address
              let shippingAddress = null;
              try {
                const addr = await Address.findOne({ userId });
                if (addr) {
                  const { fullName, mobileNumber, pincode, locality, address, city, state, landmark, alternatePhone, addressType } = addr;
                  shippingAddress = { fullName, mobileNumber, pincode, locality, address, city, state, landmark, alternatePhone, addressType };
                }
              } catch {}

              // Check if order already exists (avoid duplicates)
              const existingOrder = await Order.findOne({ payuTxnId: txnid });
              if (!existingOrder) {
                const order = await Order.create({
                  user: userId,
                  items,
                  amount: orderAmount,
                  currency: 'INR',
                  paymentMethod: 'payu',
                  status: 'paid',
                  payuTxnId: txnid,
                  payuPaymentId: mihpayid || bank_ref_num,
                  payuHash: hash,
                  shippingAddress,
                });

                cart.items = [];
                await cart.save();
                
                console.log('PayU POST callback: Order created successfully', order._id);
              } else {
                console.log('PayU POST callback: Order already exists for txnid', txnid);
              }
            }
          } else {
            console.warn('PayU POST callback: User not found for email', email);
          }
        } catch (orderErr) {
          console.error('PayU POST callback: Error creating order', orderErr);
          // Continue to redirect even if order creation fails
        }
      }
    }

    // After processing POST (or for GET requests), redirect user to frontend
    // Build redirect URL with transaction details (properly encoded)
    let redirectUrl;
    if (status === 'success') {
      const params = new URLSearchParams({
        txnid: txnid || '',
        status: status || 'success'
      });
      if (mihpayid) params.append('mihpayid', mihpayid);
      if (bank_ref_num) params.append('bank_ref_num', bank_ref_num);
      redirectUrl = `${frontendSuccessUrl}?${params.toString()}`;
    } else {
      const params = new URLSearchParams({
        txnid: txnid || '',
        status: status || 'failed'
      });
      if (error_Message) {
        params.append('error', error_Message);
      } else if (error) {
        params.append('error', error);
      } else {
        params.append('error', 'Payment failed');
      }
      redirectUrl = `${frontendFailUrl}?${params.toString()}`;
    }

    console.log('PayU redirect:', {
      status,
      redirectUrl: redirectUrl.replace(/\/\/.*@/, '//***@'), // Hide credentials if any
      txnid
    });

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('PayU verifyPayment error:', err?.message || err);
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';
    const frontendFailUrl = process.env.PAYU_FAIL_URL || `${FRONTEND_URL}/payment-fail`;
    const errorMsg = err?.message || 'Verification failed';
    const params = new URLSearchParams({
      error: errorMsg,
      status: 'failed'
    });
    return res.redirect(`${frontendFailUrl}?${params.toString()}`);
  }
};

// Legacy verifyPayment endpoint (for backward compatibility, but now handles PayU)
// This can be called from frontend after redirect
export const verifyPayment = async (req, res) => {
  try {
    const { txnid } = req.body || {};
    if (!txnid) {
      return res.status(400).json({ error: 'Missing txnid' });
    }

    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Check if order already exists with this txnid
    const existingOrder = await Order.findOne({ payuTxnId: txnid, user: userId });
    if (existingOrder) {
      return res.json({ success: true, order: existingOrder });
    }

    // If order doesn't exist, create it (this handles the case where PayU callback didn't create order)
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const items = cart.items.map(i => {
      const p = i.product;
      let base = 0;
      if (p && typeof p.price === 'number') {
        base = Number(p.price) || 0;
      } else {
        const mrp = Number(p?.mrp) || 0;
        const discountPercent = Number(p?.discountPercent) || 0;
        base = Math.round(mrp - (mrp * discountPercent) / 100) || 0;
      }
      return { product: p._id, quantity: i.quantity, price: base };
    });
    const amount = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);

    let shippingAddress = null;
    try {
      const addr = await Address.findOne({ userId });
      if (addr) {
        const { fullName, mobileNumber, pincode, locality, address, city, state, landmark, alternatePhone, addressType } = addr;
        shippingAddress = { fullName, mobileNumber, pincode, locality, address, city, state, landmark, alternatePhone, addressType };
      }
    } catch {}

    const order = await Order.create({
      user: userId,
      items,
      amount,
      currency: 'INR',
      paymentMethod: 'payu',
      status: 'paid',
      payuTxnId: txnid,
      shippingAddress,
    });

    cart.items = [];
    await cart.save();

    return res.json({ success: true, order });
  } catch (err) {
    console.error('verifyPayment error:', err?.message || err);
    return res.status(500).json({ error: 'Verification failed' });
  }
};

// Create COD (Cash on Delivery) order
export const createCODOrder = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('COD Order request - userId:', userId);
    
    if (!userId) {
      console.error('COD Order: No userId found in request');
      return res.status(401).json({ error: 'Unauthorized. Please sign in to place an order.' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    console.log('COD Order - Cart found:', cart ? `Yes, ${cart.items?.length || 0} items` : 'No');
    
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Please add items to your cart before placing an order.' });
    }

    // Calculate order items with prices
    const items = cart.items.map(i => {
      const p = i.product;
      let base = 0;
      if (p && typeof p.price === 'number') {
        base = Number(p.price) || 0;
      } else {
        const mrp = Number(p?.mrp) || 0;
        const discountPercent = Number(p?.discountPercent) || 0;
        base = Math.round(mrp - (mrp * discountPercent) / 100) || 0;
      }
      return { product: p._id, quantity: i.quantity, price: base };
    });

    const orderAmount = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);

    if (!orderAmount || orderAmount <= 0) {
      return res.status(400).json({ error: 'Invalid order amount' });
    }

    // Get shipping address
    let shippingAddress = null;
    try {
      const addr = await Address.findOne({ userId });
      if (addr) {
        const { fullName, mobileNumber, pincode, locality, address, city, state, landmark, alternatePhone, addressType } = addr;
        shippingAddress = { fullName, mobileNumber, pincode, locality, address, city, state, landmark, alternatePhone, addressType };
      } else {
        return res.status(400).json({ error: 'Shipping address not found. Please save your address first.' });
      }
    } catch (addrErr) {
      return res.status(400).json({ error: 'Shipping address not found. Please save your address first.' });
    }

    // Create COD order with status 'pending'
    const order = await Order.create({
      user: userId,
      items,
      amount: orderAmount,
      currency: 'INR',
      paymentMethod: 'cod',
      status: 'pending',
      shippingAddress,
    });

    // Clear cart after successful order creation
    cart.items = [];
    await cart.save();

    console.log('COD Order created successfully:', order._id);

    return res.json({
      success: true,
      message: 'Order placed successfully. You will pay when the order is delivered.',
      order,
    });
  } catch (err) {
    console.error('createCODOrder error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    return res.status(500).json({ 
      error: 'Failed to create COD order', 
      message: err.message || 'An unexpected error occurred. Please try again.',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};