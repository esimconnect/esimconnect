import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Plans.module.css';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [selectedCountry]);

  const fetchCountries = async () => {
    const { data } = await supabase
      .from('countries')
      .select('id, name, iso_code, flag_emoji')
      .order('name');
    if (data) setCountries(data);
  };

  const fetchPlans = async () => {
    setLoading(true);
    let query = supabase
      .from('esim_plans')
      .select('*, countries(name, flag_emoji)')
      .eq('is_active', true)
      .order('price_sgd');

    if (selectedCountry) {
      query = query.eq('country_id', selectedCountry);
    }

    const { data } = await query;
    if (data) setPlans(data);
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>eSIM Plans</h1>
          <p className={styles.sub}>Affordable data plans for 190+ countries</p>
        </div>

        <div className={styles.filters}>
          <select
            className={styles.countrySelect}
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
          >
            <option value="">🌍 All Countries</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>
                {c.flag_emoji} {c.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        ) : plans.length === 0 ? (
          <div className={styles.empty}>No plans found for this destination yet.</div>
        ) : (
          <div className={styles.grid}>
            {plans.map(plan => (
              <div key={plan.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.flag}>{plan.countries?.flag_emoji}</span>
                  <span className={styles.country}>{plan.countries?.name}</span>
                </div>
                <div className={styles.planName}>{plan.plan_name}</div>
                <div className={styles.planDetails}>
                  <span className={styles.data}>{plan.data_gb}GB</span>
                  <span className={styles.sep}>·</span>
                  <span>{plan.validity_days} days</span>
                </div>
                <div className={styles.price}>
                  <span className={styles.currency}>SGD</span>
                  <span className={styles.amount}>{plan.price_sgd}</span>
                </div>
                <button className={styles.buyBtnDisabled} disabled title="Coming soon">
                  Coming Soon
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
