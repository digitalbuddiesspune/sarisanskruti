import axios from 'axios';

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '1wFebuyq627952JQjs2c1Q4hafm8Ss5yGkxY44jX9uJbHXVGkimYiLoEmy2q';
const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

/**
 * Send OTP via Fast2SMS
 * @param {string} phone - Phone number (10 digits, without country code)
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<boolean>} - Returns true if sent successfully
 */
export async function sendOTP(phone, otp) {
  try {
    // Ensure phone is 10 digits
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      throw new Error('Phone number must be 10 digits');
    }

    const message = `Your OTP for sarisanskruti is ${otp}. Do not share this OTP with anyone. Valid for 10 minutes.`;
    
    // Fast2SMS API format
    const response = await axios.post(
      FAST2SMS_URL,
      {
        message: message,
        language: 'english',
        route: 'q',
        numbers: cleanPhone,
      },
      {
        headers: {
          authorization: FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    // Fast2SMS returns success if return is true or status code is 200
    if (response.data && (response.data.return === true || response.status === 200)) {
      console.log(`OTP sent successfully to ${cleanPhone}`);
      return true;
    }

    throw new Error(response.data?.message || 'Failed to send OTP');
  } catch (error) {
    console.error('Fast2SMS Error:', error.response?.data || error.message);
    // For development, still allow OTP to proceed
    if (process.env.NODE_ENV === 'development') {
      console.warn('Fast2SMS failed, but continuing in dev mode. OTP:', otp);
      return true;
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to send OTP');
  }
}

export default { sendOTP };

