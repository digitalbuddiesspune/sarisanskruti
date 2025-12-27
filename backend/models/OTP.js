import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    purpose: { type: String, enum: ['signup', 'signin'], required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    // Store user data temporarily for signup
    userData: {
      name: String,
      email: String,
      passwordHash: String,
    },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs (single index definition)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);
export default OTP;

