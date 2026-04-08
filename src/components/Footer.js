import React from 'react';
import { Link } from 'react-router-dom';

const BADGES = [
  { icon: '🔒', label: 'SSL Encrypted' },
  { icon: '☁️', label: 'Secured by Cloudflare' },
  { icon: '🛡️', label: 'PDPA Compliant · Singapore Law' },
  { icon: '📋', label: 'ACRA Registration Pending' },
];

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 10,
      padding: '16px 24px',
    }}>
      {/* Trust badges row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '6px 20px',
        marginBottom: '12px',
      }}>
        {BADGES.map((badge, i) => (
          <React.Fragment key={badge.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '12px' }}>{badge.icon}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                {badge.label}
              </span>
            </div>
            {i < BADGES.length - 1 && (
              <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
          © 2026 Kairos Ventures Pte. Ltd. · Singapore
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/terms" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            Terms & Conditions
          </Link>
          <a href="mailto:support@esimconnect.world" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
