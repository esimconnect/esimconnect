import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from './Plans.module.css';
import AffiliateBar from '../components/AffiliateBar';

const WORKER_URL = 'https://claude-proxy.davidlimyk.workers.dev';

const MOCK_COUNTRIES = [
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
];

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('SG');
  const [countryMeta, setCountryMeta] = useState(MOCK_COUNTRIES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans(selectedCountry);
  }, [selectedCountry]);

  const fetchPlans = async (countryCode) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${WORKER_URL}/airalo/packages?country=${countryCode}`);
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        const operator = json.data[0].operators[0];
        const packages = operator?.packages || [];
        setPlans(packages.map(pkg => ({
          ...pkg,
          operator: operator?.title || '',
          country_code: countryCode,
        })));
      } else {
        setPlans([]);
      }
    } catch (err) {
      setError('Failed to load plans. Please try again.');
      setPlans([]);
    }
    setLoading(false);
  };

  const handleCountryChange = (e) => {
    const code = e.target.value;
    setSelectedCountry(code);
    const meta = MOCK_COUNTRIES.find(c => c.code === code);
    setCountryMeta(meta || MOCK_COUNTRIES[0]);
  };

  const handleBuy = (plan) => {
    navigate('/checkout', {
      state: {
        plan: {
          id: plan.id,
          plan_name: plan.title,
          data_gb: (plan.amount / 1024).toFixed(0),
          validity_days: plan.day,
          price_sgd: (plan.price * 1.35).toFixed(2),
          price_usd: plan.price,
          operator: plan.operator,
          country_code: plan.country_code,
          is_unlimited: plan.is_unlimited,
        },
        country: {
          name: countryMeta.name,
          flag_emoji: countryMeta.flag,
          iso_code: countryMeta.code,
        },
      },
    });
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>eSIM Plans</h1>
          <p className={styles.sub}>Affordable data plans for your destination</p>
        </div>

        <div className={styles.filters}>
          <select
            className={styles.countrySelect}
            value={selectedCountry}
            onChange={handleCountryChange}
          >
            {MOCK_COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        ) : error ? (
          <div className={styles.empty}>{error}</div>
        ) : plans.length === 0 ? (
          <div className={styles.empty}>No plans found for this destination yet.</div>
        ) : (
          <>
            <AffiliateBar context="plans" />
            <div className={styles.grid}>
              {plans.map(plan => (
                <div key={plan.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.flag}>{countryMeta.flag}</span>
                    <span className={styles.country}>{countryMeta.name}</span>
                  </div>
                  <div className={styles.planName}>{plan.title}</div>
                  <div className={styles.planDetails}>
                    <span className={styles.data}>
                      {plan.is_unlimited ? 'Unlimited' : `${(plan.amount / 1024).toFixed(0)}GB`}
                    </span>
                    <span className={styles.sep}>·</span>
                    <span>{plan.day} days</span>
                  </div>
                  <div className={styles.operatorLabel}>{plan.operator}</div>
                  <div className={styles.price}>
                    <span className={styles.currency}>SGD</span>
                    <span className={styles.amount}>{(plan.price * 1.35).toFixed(2)}</span>
                  </div>
                  <button
                    className={styles.buyBtn}
                    onClick={() => handleBuy(plan)}
                  >
                    Buy Now →
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
