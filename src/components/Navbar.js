import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? styles.ctaBtn : '';

  const PlansDropdown = () => (
    <div style={{ position: 'relative' }}
      onMouseEnter={() => setPlansOpen(true)}
      onMouseLeave={() => setTimeout(() => setPlansOpen(false), 150)}
    >
      <Link to="/plans" className={isActive('/plans')} onClick={() => setMenuOpen(false)}
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        Plans <span style={{ fontSize: '10px', opacity: 0.6 }}>▾</span>
      </Link>
      {plansOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: '0', background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
          padding: '8px', minWidth: '180px', zIndex: 1000,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', marginTop: '0px',
        }}>
          <Link to="/plans" onClick={() => { setMenuOpen(false); setPlansOpen(false); }} style={{
            display: 'block', padding: '10px 14px', borderRadius: '8px',
            color: 'inherit', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
          }}>📶 Browse Plans</Link>
          <Link to="/find-order" onClick={() => { setMenuOpen(false); setPlansOpen(false); }} style={{
            display: 'block', padding: '10px 14px', borderRadius: '8px',
            color: 'inherit', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
          }}>🔍 Find My Order</Link>
        </div>
      )}
    </div>
  );

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 460" role="img"
            style={{ height: '72px', width: 'auto', display: 'block' }}>
            <defs>
              <radialGradient id="nb_gG" cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#1a4a8a"/>
                <stop offset="45%" stopColor="#0a2255"/>
                <stop offset="100%" stopColor="#040e28"/>
              </radialGradient>
              <radialGradient id="nb_haloG" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1a6aff" stopOpacity="0.22"/>
                <stop offset="100%" stopColor="#1a6aff" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="nb_cG1" cx="30%" cy="28%" r="70%">
                <stop offset="0%" stopColor="#c8e8ff"/>
                <stop offset="40%" stopColor="#5aaeff"/>
                <stop offset="100%" stopColor="#1a4aaa"/>
              </radialGradient>
              <radialGradient id="nb_cG2" cx="30%" cy="28%" r="70%">
                <stop offset="0%" stopColor="#d0f0ff"/>
                <stop offset="40%" stopColor="#40ccff"/>
                <stop offset="100%" stopColor="#0a3888"/>
              </radialGradient>
              <linearGradient id="nb_wG" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff"/>
                <stop offset="50%" stopColor="#a8d8ff"/>
                <stop offset="100%" stopColor="#5aaeff"/>
              </linearGradient>
              <clipPath id="nb_gc">
                <circle cx="340" cy="215" r="135"/>
              </clipPath>
              <style>{`
                @keyframes nb_pulseArc {
                  0%   { opacity:0; } 30% { opacity:1; } 80% { opacity:0.3; } 100% { opacity:0; }
                }
                .nb_arc1 { animation: nb_pulseArc 2.5s ease-in-out 0s infinite; }
                .nb_arc2 { animation: nb_pulseArc 2.5s ease-in-out 0.8s infinite; }
                .nb_arc3 { animation: nb_pulseArc 2.5s ease-in-out 1.6s infinite; }
                .nb_sim1 { transform-origin: 340px 215px; animation: nb_orbitH 12s linear infinite; }
                .nb_sim2 { transform-origin: 340px 215px; animation: nb_orbitV 7s linear infinite; }
                @keyframes nb_orbitH {
                  from { transform: rotate(0deg) translateX(178px) rotate(0deg); }
                  to   { transform: rotate(360deg) translateX(178px) rotate(-360deg); }
                }
                @keyframes nb_orbitV {
                  from { transform: rotate(90deg) translateY(178px) rotate(-90deg); }
                  to   { transform: rotate(450deg) translateY(178px) rotate(-450deg); }
                }
              `}</style>
            </defs>

            <circle cx="340" cy="215" r="168" fill="url(#nb_haloG)"/>
            <circle cx="340" cy="215" r="135" fill="url(#nb_gG)" stroke="#3a8aff" strokeWidth="2"/>
            <g clipPath="url(#nb_gc)">
              <ellipse cx="340" cy="215" rx="135" ry="135" fill="none" stroke="#1a6aff" strokeWidth="0.6" strokeOpacity="0.45"/>
              <ellipse cx="340" cy="215" rx="95"  ry="135" fill="none" stroke="#1a6aff" strokeWidth="0.6" strokeOpacity="0.4"/>
              <ellipse cx="340" cy="215" rx="50"  ry="135" fill="none" stroke="#1a6aff" strokeWidth="0.6" strokeOpacity="0.4"/>
              <ellipse cx="340" cy="215" rx="135" ry="5"   fill="none" stroke="#1a6aff" strokeWidth="0.7" strokeOpacity="0.55"/>
              <ellipse cx="340" cy="177" rx="122" ry="5"   fill="none" stroke="#1a6aff" strokeWidth="0.6" strokeOpacity="0.45"/>
              <ellipse cx="340" cy="253" rx="122" ry="5"   fill="none" stroke="#1a6aff" strokeWidth="0.6" strokeOpacity="0.45"/>
            </g>
            <text x="340" y="205" fontFamily="Arial, Helvetica, sans-serif" fontSize="30" fontWeight="700"
              fill="url(#nb_wG)" textAnchor="middle" letterSpacing="-0.5">
              <tspan fontWeight="300">e</tspan>Sim<tspan fontWeight="300">connect</tspan>
            </text>
            <text x="340" y="228" fontFamily="Arial, Helvetica, sans-serif" fontSize="10"
              fill="#60b0ff" textAnchor="middle" letterSpacing="3.5">150+ COUNTRIES</text>

            <g className="nb_sim1">
              <rect x="322" y="192" width="36" height="44" rx="5" fill="url(#nb_cG1)" stroke="#5ab8ff" strokeWidth="1.6"/>
              <polygon points="340,192 358,192 358,204 340,204" fill="#0a1e44"/>
              <line x1="340" y1="192" x2="358" y2="204" stroke="#5ab8ff" strokeWidth="1.4"/>
              <rect x="327" y="208" width="10" height="8" rx="2" fill="#0d2a6a" stroke="#5ab8ff" strokeWidth="0.8"/>
              <rect x="342" y="208" width="10" height="8" rx="2" fill="#0d2a6a" stroke="#5ab8ff" strokeWidth="0.8"/>
              <rect x="327" y="219" width="10" height="8" rx="2" fill="#0d2a6a" stroke="#5ab8ff" strokeWidth="0.8"/>
              <rect x="342" y="219" width="10" height="8" rx="2" fill="#0d2a6a" stroke="#5ab8ff" strokeWidth="0.8"/>
              <path d="M362,207 A28,28 0 0 1 362,181" fill="none" stroke="#5ab8ff" strokeWidth="1.4" strokeLinecap="round" className="nb_arc1"/>
              <path d="M370,212 A38,38 0 0 1 370,174" fill="none" stroke="#5ab8ff" strokeWidth="1.4" strokeLinecap="round" className="nb_arc2"/>
              <path d="M378,216 A48,48 0 0 1 378,168" fill="none" stroke="#5ab8ff" strokeWidth="1.4" strokeLinecap="round" className="nb_arc3"/>
            </g>

            <g className="nb_sim2">
              <rect x="322" y="192" width="36" height="44" rx="5" fill="url(#nb_cG2)" stroke="#5ab8ff" strokeWidth="1.6"/>
              <polygon points="340,192 358,192 358,204 340,204" fill="#0a1e44"/>
              <line x1="340" y1="192" x2="358" y2="204" stroke="#5ab8ff" strokeWidth="1.4"/>
              <rect x="327" y="208" width="10" height="8" rx="2" fill="#0d2a6a" stroke="#5ab8ff" strokeWidth="0.8"/>
              <rect x="342" y="208" width="10" height="8" rx="2" fill="#0d2a6a" stroke="#5ab8ff" strokeWidth="0.8"/>
              <rect x="327" y="219" width="10" height="8" rx="2" fill="#0d2a6a" stroke="#5ab8ff" strokeWidth="0.8"/>
              <rect x="342" y="219" width="10" height="8" rx="2" fill="#0d2a6a" stroke="#5ab8ff" strokeWidth="0.8"/>
              <path d="M362,207 A28,28 0 0 1 362,181" fill="none" stroke="#40ccff" strokeWidth="1.4" strokeLinecap="round" className="nb_arc1"/>
              <path d="M370,212 A38,38 0 0 1 370,174" fill="none" stroke="#40ccff" strokeWidth="1.4" strokeLinecap="round" className="nb_arc2"/>
              <path d="M378,216 A48,48 0 0 1 378,168" fill="none" stroke="#40ccff" strokeWidth="1.4" strokeLinecap="round" className="nb_arc3"/>
            </g>
          </svg>
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {user ? (
            <>
              <PlansDropdown />
              <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/purchases" className={isActive('/purchases')} onClick={() => setMenuOpen(false)}>
                My Purchases
              </Link>
              <Link to="/itinerary" className={isActive('/itinerary')} onClick={() => setMenuOpen(false)}>
                Itinerary
              </Link>
              <Link to="/saved-itineraries" className={isActive('/saved-itineraries')} onClick={() => setMenuOpen(false)}>
                Saved Trips
              </Link>
              <Link to="/terms" className={isActive('/terms')} onClick={() => setMenuOpen(false)}>
                T&C
              </Link>
              <button className={styles.signOutBtn} onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className={styles.ctaBtn} onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
              <Link to="/login" className={styles.loginBtn} onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <PlansDropdown />
              <Link to="/itinerary" className={isActive('/itinerary')} onClick={() => setMenuOpen(false)}>
                Itinerary
              </Link>
              <Link to="/terms" className={isActive('/terms')} onClick={() => setMenuOpen(false)}>
                T&C
              </Link>
            </>
          )}
        </div>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}
