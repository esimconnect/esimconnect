import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Dashboard.module.css';

export default function SavedItineraries() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }
    setUser(user);
    await fetchItineraries(user.id);
    setLoading(false);
  };

  const fetchItineraries = async (userId) => {
    const { data } = await supabase
      .from('saved_itineraries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setItineraries(data);
  };

  const deleteItinerary = async (id) => {
    if (!window.confirm('Delete this itinerary?')) return;
    setDeleting(id);
    await supabase.from('saved_itineraries').delete().eq('id', id);
    setItineraries(prev => prev.filter(i => i.id !== id));
    setDeleting(null);
  };

  const loadItinerary = (item) => {
    // Store in sessionStorage and navigate to itinerary page
    sessionStorage.setItem('loadedItinerary', JSON.stringify(item.trip_data));
    navigate('/itinerary');
  };

  const DAY_COLORS = ['#00c8ff','#ff6b9d','#4cd964','#f5a623','#bf5af2','#ff9f0a','#30d158','#64d2ff'];

  if (loading) return <div className={styles.loadingPage}><div className={styles.spinner}></div></div>;

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Saved Itineraries</h1>
            <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Your saved travel plans</p>
          </div>
          <button onClick={() => navigate('/itinerary')} style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: '#000', border: 'none', borderRadius: '12px', padding: '10px 22px',
            fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-head)', cursor: 'pointer'
          }}>+ New Itinerary</button>
        </div>

        {itineraries.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🗺️</div>
            <h3>No saved itineraries yet</h3>
            <p>Build a route and save it to see it here.</p>
            <button className={styles.browsePlansBtn} onClick={() => navigate('/itinerary')}>
              Plan a Trip →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {itineraries.map(item => {
              const plan = item.trip_data;
              const days = plan?.days || [];
              const totalStops = days.reduce((sum, d) => sum + (d.stops?.length || 0), 0);
              return (
                <div key={item.id} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  borderRadius: '20px', padding: '24px',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '20px' }}>
                        {plan?.destination || item.destination}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                        Saved {new Date(item.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        &nbsp;·&nbsp;{days.length} day{days.length !== 1 ? 's' : ''}
                        &nbsp;·&nbsp;{totalStops} stops
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => loadItinerary(item)}
                        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#000', border: 'none', borderRadius: '10px', padding: '8px 18px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                      >
                        Load Trip →
                      </button>
                      <button
                        onClick={() => deleteItinerary(item.id)}
                        disabled={deleting === item.id}
                        style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff6b6b', borderRadius: '10px', padding: '8px 14px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                      >
                        {deleting === item.id ? '...' : '🗑️'}
                      </button>
                    </div>
                  </div>

                  {/* Day pills */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {days.map(day => (
                      <span key={day.day} style={{
                        background: DAY_COLORS[(day.day - 1) % DAY_COLORS.length] + '22',
                        border: '1px solid ' + DAY_COLORS[(day.day - 1) % DAY_COLORS.length] + '55',
                        color: DAY_COLORS[(day.day - 1) % DAY_COLORS.length],
                        borderRadius: '8px', padding: '3px 10px', fontSize: '12px', fontWeight: 700
                      }}>
                        Day {day.day} · {day.stops?.length || 0} stops
                      </span>
                    ))}
                  </div>

                  {/* First day preview */}
                  {days[0]?.stops?.slice(0, 3).map((stop, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderTop: i === 0 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ background: DAY_COLORS[0] + '33', color: DAY_COLORS[0], borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{stop.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{stop.category} · {stop.duration}</div>
                      </div>
                    </div>
                  ))}
                  {days[0]?.stops?.length > 3 && (
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
                      + {days[0].stops.length - 3} more stops on Day 1 · Load to see full itinerary
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
