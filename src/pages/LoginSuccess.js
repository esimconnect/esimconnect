import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function LoginSuccess() {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#0a0f1a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '48px 40px', maxWidth: '420px', width: '90%', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>You are signed in!</h1>
          <p style={{ color: '#888', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
            Go back to your itinerary tab to continue planning your trip.
          </p>
          <button onClick={() => { if (window.opener) { window.close(); } else { navigate('/itinerary'); } }} style={{
            background: 'linear-gradient(135deg, #00c8ff, #7b2fff)',
            border: 'none', borderRadius: '12px', padding: '14px 32px',
            color: '#000', fontWeight: 800, fontSize: '15px', cursor: 'pointer', width: '100%',
          }}>Back to Itinerary</button>
        </div>
      </div>
    </div>
  );
}