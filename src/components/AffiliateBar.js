import React from 'react';

const AFFILIATES = [
  { name: 'Tiqets',       category: 'Activities',       url: 'https://tiqets.tpx.li/SxvCe59l' },
  { name: 'Booking.com',  category: 'Hotels',           url: 'https://booking.com' },
  { name: 'Klook',        category: 'Activities',       url: 'https://klook.tpx.li/fcPQnosy' },
  { name: 'Expedia',      category: 'Flights & Hotels', url: 'https://expedia.com' },
];

const COPY = {
  itinerary: 'Have you booked your trip yet?',
  plans:     'Complete your trip — book hotels, flights & activities:',
  success:   "You're almost travel-ready — book the rest of your trip:",
};

/**
 * AffiliateBar
 * Props:
 *   context  — 'itinerary' | 'plans' | 'success'
 *   dark     — boolean, use dark theme (for dark-bg pages)
 *   style    — optional style overrides
 *   className
 */
export default function AffiliateBar({ context = 'itinerary', dark = false, style, className }) {
  const label = COPY[context] || COPY.itinerary;

  const wrap = dark ? {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '14px 18px',
    margin: '0 0 24px',
  } : {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '14px 18px',
    margin: '0 0 24px',
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    color: 'rgba(255,255,255,0.7)',
  };

  const btnBase = {
    fontSize: '13px',
    fontWeight: 500,
    padding: '6px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'border-color 0.15s, color 0.15s, background 0.15s',
  };

  const btnStyle = dark ? {
    ...btnBase,
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.85)',
  } : {
    ...btnBase,
    border: '1px solid rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.9)',
  };

  const hoverIn = dark
    ? (e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }
    : (e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; };

  const hoverOut = dark
    ? (e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }
    : (e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#111827'; };

  return (
    <div className={className} style={{ ...wrap, ...style }}>
      <span style={labelStyle}>{label}</span>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {AFFILIATES.map((aff) => (
          <a
            key={aff.name}
            href={aff.url}
            target="_blank"
            rel="noopener noreferrer"
            title={aff.category}
            style={btnStyle}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            {aff.name}
          </a>
        ))}
      </div>
    </div>
  );
}
