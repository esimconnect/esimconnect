import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, plan, country } = location.state || {};

  if (!order) {
    navigate('/plans');
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navbar />
      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 16px' }}>
        
        {/* Success Icon */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#d1fae5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px'
          }}>
            ✅
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
            Order Confirmed!
          </h1>
          <p style={{ color: '#6b7280' }}>
            Thank you for your purchase. Your eSIM will be delivered shortly.
          </p>
        </div>

        {/* Order Details */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            Order Details
          </h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#6b7280' }}>Order Number</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>{order.order_number}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#6b7280' }}>Destination</span>
            <span>{country?.flag_emoji} {country?.name}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#6b7280' }}>Plan</span>
            <span>{plan?.plan_name}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#6b7280' }}>Data</span>
            <span>{plan?.data_gb}GB · {plan?.validity_days} days</span>
          </div>

          <hr style={{ margin: '12px 0', borderColor: '#e5e7eb' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Subtotal</span>
            <span>SGD {parseFloat(order.subtotal_sgd).toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>GST (9%)</span>
            <span>SGD {parseFloat(order.gst_sgd).toFixed(2)}</span>
          </div>

          <hr style={{ margin: '12px 0', borderColor: '#e5e7eb' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700', color: '#111827' }}>Total Paid</span>
            <span style={{ fontWeight: '700', color: '#2563eb', fontSize: '18px' }}>
              SGD {parseFloat(order.total_sgd).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Status */}
        <div style={{
          backgroundColor: '#fffbeb',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid #fde68a'
        }}>
          <p style={{ color: '#92400e', fontSize: '14px', margin: 0 }}>
            🕐 Your eSIM QR code is being prepared and will be delivered to your email shortly.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/plans')}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'white',
              color: '#2563eb',
              border: '1px solid #2563eb',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Browse More Plans
          </button>
        </div>

      </main>
    </div>
  );
}