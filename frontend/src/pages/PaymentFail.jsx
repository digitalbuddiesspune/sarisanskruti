import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const errorMsg = searchParams.get('error') || searchParams.get('error_Message') || searchParams.get('error_message') || 'Payment failed';

  useEffect(() => {
    // Auto-redirect to profile after 5 seconds
    const timer = setTimeout(() => {
      navigate('/profile?tab=orders', { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-6">{errorMsg}</p>
        <p className="text-sm text-gray-500 mb-6">Redirecting to orders page in 5 seconds...</p>
        {errorMsg && errorMsg.includes('Too many requests') && (
          <p className="text-sm text-amber-600 mb-4 font-medium">
            ⚠️ Please wait 60 seconds before trying again.
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/checkout/address', { replace: true })}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/profile?tab=orders', { replace: true })}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;

