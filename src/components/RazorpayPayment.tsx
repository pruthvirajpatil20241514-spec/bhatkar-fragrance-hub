/**
 * Razorpay Payment Component
 * ==========================
 * React component for handling Razorpay payments
 * 
 * Usage:
 * <RazorpayPayment productId={123} onSuccess={handleSuccess} />
 */

import React, { useState, useCallback } from 'react';
import api from '../lib/axios';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  productId: number;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  quantity?: number;
  buttonText?: string;
  buttonClassName?: string;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  productId,
  onSuccess,
  onError,
  quantity = 1,
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
   * Handle payment process
   */
  const handlePayment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // 2. Create order on backend
      const orderResponse = await api.post('/api/payment/create-order', {
        productId,
        quantity
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.error || 'Failed to create order');
      }

      const { razorpayOrderId, amount, orderId, productName } = orderResponse.data;

      // 3. Open Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        name: 'Bhatkar Fragrance Hub',
        description: `Purchase - ${productName}`,
        order_id: razorpayOrderId,
        
        // Success handler
        handler: async (response: any) => {
          try {
            setLoading(true);

            // 4. Verify payment on backend
            const verifyResponse = await api.post('/api/payment/verify', {
              orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              // Payment successful
              if (onSuccess) {
                onSuccess({
                  orderId,
                  paymentId: response.razorpay_payment_id,
                  amount
                });
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err: any) {
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

        // Contact information
        prefill: {
          email: localStorage.getItem('userEmail') || '',
          contact: localStorage.getItem('userPhone') || ''
        },

        // Theme
        theme: {
          color: '#FF6B35'
        },

        // Notes
        notes: {
          productId,
          quantity
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Payment failed';
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [productId, quantity, loadRazorpayScript, onSuccess, onError]);

  return (
    <div className="razorpay-payment">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className={`${buttonClassName} ${loading ? 'disabled' : ''}`}
        style={{
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Processing...' : buttonText}
      </button>
    </div>
  );
};

export default RazorpayPayment;
