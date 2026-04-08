import React from 'react';

const BADGES = [
  {
    icon: '🔒',
    label: 'SSL Encrypted',
    sub: 'Secure connection',
  },
  {
    icon: '☁️',
    label: 'Secured by Cloudflare',
    sub: 'DDoS protection',
  },
  {
    icon: '🛡️',
    label: 'PDPA Compliant',
    sub: 'Singapore Law',
  },
  {
    icon: '📋',
    label: 'ACRA Registration',
    sub: 'Pending · Singapore',
  },
];

/**
 * TrustBadge
 * Props:
 *   dark  — boolean, dark theme (default true)
 *   style — optional style overrides
 */
export default function TrustBadge({ dark = true, style }) {
  const wrap = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '8px 24px',
    padding: '16px 24px',
    borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb',
    ...style,
  };

  const badgeStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const iconStyle = {
    fontSize: '14px',
    lineHeight: 1,
  };

  const textWrap = {
    display: 'flex',
    flexDirection: 'column',
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 600,
    color: dark ? 'rgba(255,255,255,0.7)' : '#374151',
    lineHeight: 1.2,
  };

  const subStyle = {
    fontSize: '10px',
    color: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af',
    lineHeight: 1.2,
  };

  const dividerStyle = {
    width: '1px',
    height: '24px',
    background: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
  };

  return (
    <div style={wrap}>
      {BADGES.map((badge, i) => (
        <React.Fragment key={badge.label}>
          <div style={badgeStyle}>
            <span style={iconStyle}>{badge.icon}</span>
            <div style={textWrap}>
              <span style={labelStyle}>{badge.label}</span>
              <span style={subStyle}>{badge.sub}</span>
            </div>
          </div>
          {i < BADGES.length - 1 && <div style={dividerStyle} />}
        </React.Fragment>
      ))}
    </div>
  );
}
