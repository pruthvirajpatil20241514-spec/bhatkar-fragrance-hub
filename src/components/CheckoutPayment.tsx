/**
 * Checkout Payment Component
 * ==========================
 * Handles Razorpay payments for checkout with multiple cart items
 */

import React, { useState, useCallback } from 'react';
import api from '../lib/axios';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutPaymentProps {
  items: Array<{ productId: number; quantity: number; price: number }>;
  totalAmount: number;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  buttonText?: string;
  buttonClassName?: string;
}

const CheckoutPayment: React.FC<CheckoutPaymentProps> = ({
  items,
  totalAmount,
  onSuccess,
  onError,
  buttonText = 'Pay Now',
  buttonClassName = 'btn-primary'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load Razorpay script from CDN
   */
  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  /**
   * Handle payment process - Create order on backend for first cart item
   * Backend will fetch the price and ensure security
   */
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');

  // Core payment flow extracted to allow prefill collection first
  const doPayment = useCallback(async (prefillContact: string | null) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🛒 Starting payment process...');

      // 1. Load Razorpay script
      console.log('📦 Loading Razorpay script...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script - check CDN access');
      }
      console.log('✅ Razorpay script loaded');

      console.log(`🔄 Creating order for ${items.length} items...`);
      console.log(`📡 API Base URL: ${import.meta.env.VITE_API_BASE_URL}`);

      const orderResponse = await api.post('/payment/create-order', {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        contact: prefillContact || null
      });

      console.log('📨 Order creation response:', orderResponse.status, orderResponse.data);

      if (!orderResponse.data.success) {
        const errorMsg = orderResponse.data.error || 'Failed to create order';
        console.error('❌ Order creation failed:', errorMsg);
        throw new Error(errorMsg);
      }

      const { razorpayOrderId, amount, orderId, productName } = orderResponse.data;
      console.log(`✅ Order created: ${orderId}, Razorpay Order: ${razorpayOrderId}, Amount: ₹${amount}`);

      // 3. Open Razorpay checkout
      console.log('🎯 Opening Razorpay Checkout modal...');
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SG2Tx6WI4tXjVc',
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        name: 'Bhatkar Fragrance Hub',
        description: `Order - ${productName}`,
        order_id: razorpayOrderId,

        // Success handler
        handler: async (response: any) => {
          try {
            setLoading(true);

            // 4. Verify payment on backend
            console.log('💳 Payment successful, verifying on backend...');
            console.log('Payment ID:', response.razorpay_payment_id);

            const verifyResponse = await api.post('/payment/verify', {
              orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            console.log('✅ Verification response:', verifyResponse.data);

            if (verifyResponse.data.success) {
              console.log('🎉 Payment verified successfully! Order:', orderId);
              // Payment successful
              if (onSuccess) {
                onSuccess({
                  orderId,
                  paymentId: response.razorpay_payment_id,
                  amount
                });
              }
            } else {
              throw new Error('Payment verification failed - ' + verifyResponse.data.error);
            }
          } catch (err: any) {
            console.error('❌ Payment error:', err.message);
            setError(err.message || 'Payment verification failed');
            if (onError) {
              onError(err);
            }
          } finally {
            setLoading(false);
          }
        },

        // Error handler
        modal: {
          ondismiss: () => {
            setError('Payment cancelled');
          }
        },

        // Contact information - prefill from checkout form if available
        prefill: {
          email: localStorage.getItem('userEmail') || '',
          contact: prefillContact || ''
        },

        // Theme
        theme: {
          color: '#D4A574'
        },

        // Notes
        notes: {
          cartItems: items.length,
          totalAmount
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Payment failed';
      console.error('❌ Payment initialization error:', {
        message: errorMessage,
        status: err.response?.status,
        url: err.response?.config?.url,
        method: err.response?.config?.method,
        fullError: err
      });
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [items, totalAmount, loadRazorpayScript, onSuccess, onError]);

  const handlePayment = useCallback(() => {
    // Check local saved phone first
    const saved = localStorage.getItem('userPhone') || '';
    if (saved) {
      // proceed immediately
      void doPayment(saved);
      return;
    }

    // show modal to collect phone
    setPhoneInput('');
    setShowPhoneModal(true);
  }, [doPayment]);

  return (
    <div className="checkout-payment">
      {error && (
        <div className="alert alert-danger" role="alert" style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c33'
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className={buttonClassName}
        style={{
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Processing...' : buttonText}
      </button>

      {showPhoneModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 340, boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0, marginBottom: 8 }}>Enter mobile number</h3>
            <p style={{ marginTop: 0, marginBottom: 12, color: '#555', fontSize: 13 }}>Include country code (e.g. 919876543210)</p>
            <input
              autoFocus
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="919876543210"
              style={{ width: '100%', padding: '8px 10px', marginBottom: 12, borderRadius: 4, border: '1px solid #ddd' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowPhoneModal(false)} style={{ padding: '8px 12px' }}>Cancel</button>
              <button
                type="button"
                onClick={() => {
                  const cleaned = phoneInput.trim();
                  if (cleaned) {
                    try { localStorage.setItem('userPhone', cleaned); } catch (e) { /* ignore */ }
                    setShowPhoneModal(false);
                    void doPayment(cleaned);
                  } else {
                    setError('Please enter a valid phone number');
                  }
                }}
                style={{ padding: '8px 12px' }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPayment;
