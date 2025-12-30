import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOTP } from '../services/fast2sms.js';

function generateJwt(userId) {
  const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
}

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash });

    const token = generateJwt(user.id);
    return res.status(201).json({
      message: 'Account created',
      user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Signup failed', error: err.message });
  }
}

export async function signin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateJwt(user.id);
    return res.json({
      message: 'Signed in',
      user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Signin failed', error: err.message });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If account exists, email sent' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    user.resetPasswordToken = token;
    user.resetPasswordExpiresAt = expires;
    await user.save();

    // Normally send email with link containing token; for now, return token
    return res.json({ message: 'Reset token generated', token });
  } catch (err) {
    return res.status(500).json({ message: 'Forgot password failed', error: err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.passwordHash = await User.hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    return res.json({ message: 'Password updated' });
  } catch (err) {
    return res.status(500).json({ message: 'Reset password failed', error: err.message });
  }
}

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP for signup or signin
export async function sendOTPForAuth(req, res) {
  try {
    const { phone, purpose } = req.body; // purpose: 'signup' or 'signin'
    
    if (!phone || !purpose) {
      return res.status(400).json({ message: 'Phone and purpose are required' });
    }

    if (!['signup', 'signin'].includes(purpose)) {
      return res.status(400).json({ message: 'Purpose must be signup or signin' });
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }

    // For signin, check if user exists
    if (purpose === 'signin') {
      const user = await User.findOne({ phone: cleanPhone });
      if (!user) {
        return res.status(404).json({ message: 'No account found with this phone number' });
      }
    }

    // For signup, check if phone already exists
    if (purpose === 'signup') {
      const existingUser = await User.findOne({ phone: cleanPhone });
      if (existingUser) {
        return res.status(409).json({ message: 'Phone number already registered' });
      }
    }

    // Check for recent OTP (rate limiting - max 1 per minute)
    const recentOTP = await OTP.findOne({
      phone: cleanPhone,
      purpose,
      createdAt: { $gt: new Date(Date.now() - 60000) }, // 1 minute ago
    });

    if (recentOTP) {
      return res.status(429).json({ message: 'Please wait before requesting another OTP' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    const otpDoc = await OTP.create({
      phone: cleanPhone,
      otp,
      purpose,
      expiresAt,
    });

    // Store user data for signup if provided
    if (purpose === 'signup' && req.body.userData) {
      // Hash password before storing
      const passwordHash = await User.hashPassword(req.body.userData.passwordHash);
      otpDoc.userData = {
        name: req.body.userData.name,
        email: req.body.userData.email,
        passwordHash,
      };
      await otpDoc.save();
    }

    // Send OTP via Fast2SMS
    try {
      await sendOTP(cleanPhone, otp);
    } catch (smsError) {
      // Still return success for development, but log error
      console.error('Failed to send OTP via SMS:', smsError.message);
      // For development, you might want to return the OTP in response
      if (process.env.NODE_ENV === 'development') {
        return res.json({ 
          message: 'OTP generated (dev mode)', 
          otp, // Only in dev mode
          expiresIn: 600 
        });
      }
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }

    return res.json({ 
      message: 'OTP sent successfully to your phone',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
}

// Verify OTP for signup
export async function verifyOTPSignup(req, res) {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    
    // Find OTP record
    const otpDoc = await OTP.findOne({
      phone: cleanPhone,
      purpose: 'signup',
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check attempts
    if (otpDoc.attempts >= 5) {
      return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (otpDoc.otp !== otp) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if user data exists
    if (!otpDoc.userData || !otpDoc.userData.name || !otpDoc.userData.email) {
      return res.status(400).json({ message: 'User data not found. Please complete signup again.' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: otpDoc.userData.email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      name: otpDoc.userData.name,
      email: otpDoc.userData.email,
      phone: cleanPhone,
      passwordHash: otpDoc.userData.passwordHash,
      provider: 'local',
    });

    // Mark OTP as verified
    otpDoc.verified = true;
    await otpDoc.save();

    const token = generateJwt(user.id);
    return res.status(201).json({
      message: 'Account created successfully',
      user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
      token,
    });
  } catch (err) {
    console.error('Verify OTP signup error:', err);
    return res.status(500).json({ message: 'Signup failed', error: err.message });
  }
}

// Verify OTP for signin
export async function verifyOTPSignin(req, res) {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    
    // Find OTP record
    const otpDoc = await OTP.findOne({
      phone: cleanPhone,
      purpose: 'signin',
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check attempts
    if (otpDoc.attempts >= 5) {
      return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (otpDoc.otp !== otp) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Find user
    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark OTP as verified
    otpDoc.verified = true;
    await otpDoc.save();

    const token = generateJwt(user.id);
    return res.json({
      message: 'Signed in successfully',
      user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
      token,
    });
  } catch (err) {
    console.error('Verify OTP signin error:', err);
    return res.status(500).json({ message: 'Signin failed', error: err.message });
  }
}

export default { signup, signin, forgotPassword, resetPassword, sendOTPForAuth, verifyOTPSignup, verifyOTPSignin };


