import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../services/api';
import { useCart } from '../context/CartContext';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadCart } = useCart();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const orderType = searchParams.get('type'); // 'cod' or null (PayU)

  useEffect(() => {
    let redirectTimer = null;
    let isMounted = true;
    
    const verify = async () => {
      // If COD order, skip verification and show success immediately
      if (orderType === 'cod') {
        await loadCart();
        setVerifying(false);
        return;
      }

      // PayU sends txnid and status in URL params
      const txnid = searchParams.get('txnid');
      const status = searchParams.get('status');
      
      console.log('Payment Success - URL params:', {
        txnid,
        status,
        allParams: Object.fromEntries(searchParams.entries())
      });

      // Always redirect to profile after a delay, regardless of verification
      // Verification is optional and happens in background
      const redirectTimer = setTimeout(() => {
        navigate('/profile?tab=orders', { replace: true });
      }, 5000);

      // Try to verify in background (non-blocking)
      if (txnid) {
        try {
          const result = await verifyPayment({ txnid });
          if (result && result.success) {
            await loadCart();
            console.log('Payment verified successfully');
          } else {
            console.warn('Payment verification returned false');
            if (isMounted) {
              setError('Payment verification failed, but redirecting...');
            }
          }
        } catch (e) {
          console.error('Verification error:', e);
          if (isMounted) {
            setError('Payment verification failed, but redirecting...');
          }
          // Don't block redirect on verification error
        } finally {
          if (isMounted) {
            setVerifying(false);
          }
        }
      } else {
        // No txnid - still redirect to profile
        if (isMounted) {
          setError('Transaction ID not found');
          setVerifying(false);
        }
      }
    };

    verify();
  }, [searchParams, navigate, loadCart, orderType]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/profile?tab=orders')}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Go to Orders
          </button>
        </div>
      </div>
    );
  }

  // COD Success Page
  if (orderType === 'cod') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-lg text-gray-700 mb-2">
              <span className="font-semibold">Thank you for your order!</span>
            </p>
            <p className="text-gray-600">
              Your order has been confirmed and will be processed shortly. You will pay <span className="font-semibold text-gray-900">cash on delivery</span> when your order arrives.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start justify-center text-left bg-gray-50 rounded-lg p-4">
              <svg className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900 mb-1">What's Next?</p>
                <p className="text-sm text-gray-600">
                  You will receive order confirmation details via email/SMS. Our team will prepare your order and it will be shipped soon.
                </p>
              </div>
            </div>

            <div className="flex items-start justify-center text-left bg-gray-50 rounded-lg p-4">
              <svg className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900 mb-1">Cash on Delivery</p>
                <p className="text-sm text-gray-600">
                  Please keep exact cash ready for the delivery. Our delivery partner will collect the payment upon delivery.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/profile?tab=orders', { replace: true })}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PayU Success Page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">Your order has been confirmed. Redirecting to orders page...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-500">If not redirected automatically, <button onClick={() => navigate('/profile?tab=orders', { replace: true })} className="text-amber-600 hover:underline">click here</button></p>
      </div>
    </div>
  );
};

export default PaymentSuccess;

