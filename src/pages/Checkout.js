import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ plan, country }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');

  const subtotal = parseFloat(plan.price_sgd);
  const gst = parseFloat((subtotal * 0.09).toFixed(2));
  const total = parseFloat((subtotal + gst).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Generate order number
      const orderNumber = 'ORD-' + Date.now();

      // Save order to Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user?.id || null,
          guest_email: user ? null : email,
          plan_id: plan.id,
          country_id: plan.country_id,
          subtotal_sgd: subtotal,
          gst_sgd: gst,
          total_sgd: total,
          payment_method: 'card',
          payment_status: 'pending',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Navigate to confirmation
      navigate('/order-confirmation', { 
        state: { order, plan, country } 
      });

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!localStorage.getItem('user') && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>
          Card Details
        </label>
        <div style={{
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#374151',
                '::placeholder': { color: '#9ca3af' }
              }
            }
          }} />
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: loading ? '#9ca3af' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Processing...' : `Pay SGD ${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan, country } = location.state || {};

  useEffect(() => {
    if (!plan) navigate('/plans');
  }, [plan, navigate]);

  if (!plan) return null;

  const subtotal = parseFloat(plan.price_sgd);
  const gst = parseFloat((subtotal * 0.09).toFixed(2));
  const total = parseFloat((subtotal + gst).toFixed(2));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navbar />
      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>
          Checkout
        </h1>

        {/* Order Summary */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            Order Summary
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>{country?.flag_emoji} {country?.name}</span>
            <span style={{ fontWeight: '600' }}>{plan.plan_name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Data</span>
            <span>{plan.data_gb}GB · {plan.validity_days} days</span>
          </div>
          <hr style={{ margin: '12px 0', borderColor: '#e5e7eb' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Subtotal</span>
            <span>SGD {subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>GST (9%)</span>
            <span>SGD {gst.toFixed(2)}</span>
          </div>
          <hr style={{ margin: '12px 0', borderColor: '#e5e7eb' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700', color: '#111827' }}>Total</span>
            <span style={{ fontWeight: '700', color: '#2563eb', fontSize: '18px' }}>
              SGD {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            Payment Details
          </h2>
          <Elements stripe={stripePromise}>
            <CheckoutForm plan={plan} country={country} />
          </Elements>
        </div>
      </main>
    </div>
  );
}