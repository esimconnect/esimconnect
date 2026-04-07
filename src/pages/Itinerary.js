import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Dashboard.module.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CLAUDE_API = 'https://claude-proxy.kairosventure-io.workers.dev';
const MODEL = 'claude-sonnet-4-20250514';

const STANDARD_CATEGORIES = [
  { id: 'food', label: '🍽️ Food & Dining', desc: 'Restaurants, cafes, street food' },
  { id: 'shopping_malls', label: '🏬 Shopping Malls', desc: 'Major malls and retail centres' },
  { id: 'specialty_shops', label: '🛍️ Specialty Shops', desc: 'Local markets, boutiques, artisan shops' },
  { id: 'attractions', label: '🏛️ Places of Interest', desc: 'Landmarks, museums, heritage sites' },
  { id: 'nature', label: '🌿 Nature & Parks', desc: 'Parks, gardens, scenic spots' },
  { id: 'culture', label: '🎭 Culture & Arts', desc: 'Galleries, theatres, cultural centres' },
  { id: 'nightlife', label: '🌙 Nightlife', desc: 'Bars, clubs, night markets' },
  { id: 'wellness', label: '💆 Wellness & Spas', desc: 'Spas, massage, wellness centres' },
  { id: 'sports', label: '⚽ Sports & Activities', desc: 'Adventure, sports venues' },
  { id: 'transport', label: '🚌 Getting Around', desc: 'Key transport tips and hubs' },
];

function MapBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markers, map]);
  return null;
}

const DAY_COLORS = ['#00c8ff','#ff6b9d','#4cd964','#f5a623','#bf5af2','#ff9f0a','#30d158','#64d2ff'];

function NumberedIcon(number, day) {
  const color = DAY_COLORS[((day || 1) - 1) % DAY_COLORS.length];
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};color:#000;font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);">${number}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}


function AddPlaceSearch({ activeTrip, onAdd }) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [searching, setSearching] = React.useState(false);
  const [confirming, setConfirming] = React.useState(null);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    try {
      const dest = encodeURIComponent((activeTrip && activeTrip.destination) || '');
      const q = encodeURIComponent(query);
      const res = await fetch(
        'https://nominatim.openstreetmap.org/search?q=' + q + '+' + dest + '&format=json&limit=5&addressdetails=1',
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setResults(data.map(r => ({
        name: r.name || r.display_name.split(',')[0],
        address: r.display_name,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
      })));
    } catch(e) {}
    setSearching(false);
  };

  const addConfirmed = () => {
    if (!confirming) return;
    onAdd({
      ...confirming,
      id: 'custom_' + Math.random().toString(36).substr(2, 8),
      category: 'My Additions',
      subcategory: 'Custom',
      trustSource: 'Added by you',
      desc: '',
      duration: '1 hr',
    });
    setConfirming(null);
    setQuery('');
    setResults([]);
  };


  return (
    <div style={{ background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.2)', borderRadius: '16px', padding: '16px 20px', marginBottom: '8px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>
        🔍 Can't find a place? Search & add it
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder={'Search a place in ' + ((activeTrip && activeTrip.destination) || 'your destination') + '...'}
          style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '13px' }}
        />
        <button
          onClick={search}
          disabled={searching}
          style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
        >
          {searching ? '...' : 'Search'}
        </button>
      </div>
      {results.length > 0 && !confirming && (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {results.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', gap: '8px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{r.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>📍 {r.address}</div>
              </div>
              <button
                onClick={() => setConfirming(r)}
                style={{ background: 'rgba(0,200,255,0.15)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      )}
      {confirming && (
        <div style={{ marginTop: '10px', background: 'rgba(76,217,100,0.08)', border: '1px solid rgba(76,217,100,0.3)', borderRadius: '10px', padding: '12px 16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>✅ Confirm adding this place?</div>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>{confirming.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>📍 {confirming.address}</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={addConfirmed}
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#000', border: 'none', borderRadius: '8px', padding: '6px 18px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
            >
              ✓ Yes, Add It
            </button>
            <button
              onClick={() => setConfirming(null)}
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Itinerary() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detectedTrip, setDetectedTrip] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  const [showInterests, setShowInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState({});
  const [extraCategories, setExtraCategories] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selected, setSelected] = useState({});
  const [routing, setRouting] = useState(false);
  const [routedPlan, setRoutedPlan] = useState(null);
  const [activeMapDay, setActiveMapDay] = React.useState(null);
  const [showGateModal, setShowGateModal] = React.useState(false);
  const [gateReason, setGateReason] = React.useState('guest');
  const [isPlanBuyer, setIsPlanBuyer] = React.useState(false);
  const [itineraryCount, setItineraryCount] = React.useState(0);

  // ── Dev bypass — set to false to activate gates in production ──────────
  const IS_DEV = false;

  // ── Gate check ───────────────────────────────────────────────────────────
  const checkGate = async () => {
    if (IS_DEV) return true;
    if (isPlanBuyer) return true;
    if (!user) {
      try {
        const res = await fetch('https://claude-proxy.kairosventure-io.workers.dev/check-guest', { method: 'POST' });
        const ipData = await res.json();
        if (ipData.allowed === false) { setGateReason('guest'); setShowGateModal(true); return false; }
      } catch(e) {}
      const guestCount = parseInt(localStorage.getItem('esim_iti_count') || '0');
      if (guestCount >= 2) {
        setGateReason('guest');
        setShowGateModal(true);
        return false;
      }
      localStorage.setItem('esim_iti_count', String(guestCount + 1));
      fetch('https://claude-proxy.kairosventure-io.workers.dev/track-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'itinerary_search', type: 'guest' }),
      }).catch(() => {});
      return true;
    }
    if (itineraryCount >= 5) {
      setGateReason('registered');
      setShowGateModal(true);
      return false;
    }
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      action: 'itinerary_search',
      type: 'registered',
    });
    setItineraryCount(prev => prev + 1);
    return true;
  };


  // Load saved itinerary from sessionStorage if present
  useEffect(() => {
    const loaded = sessionStorage.getItem("loadedItinerary");
    if (loaded) {
      try {
        setRoutedPlan(JSON.parse(loaded));
        sessionStorage.removeItem("loadedItinerary");
      } catch(e) {}
    }
  }, []);
  const [savedStatus, setSavedStatus] = React.useState('');
  const [savingList, setSavingList] = React.useState('');
  const saveItinerary = async () => {

    if (!user) {
      setGateReason('guest');
      setShowGateModal(true);
      return;
    }
    setSavedStatus('saving');
    const { data: saveData, error } = await supabase.from('saved_itineraries').insert({
      user_id: user.id,
      destination: routedPlan.destination,
      trip_data: routedPlan,
    });
    if (error) {
      console.error('Save error:', error.message, error.code, error.details);
      setSavedStatus('error');
    } else {
      setSavedStatus('saved');
    }
    setTimeout(() => setSavedStatus(''), 3000);
  };

  const savePickedPlaces = async () => {
    if (!user) { setGateReason('guest'); setShowGateModal(true); return; }
    setSavingList('saving');
    const pickedPlaces = (suggestions?.places || []).filter(p => selected[p.id]);
    const { error } = await supabase.from('saved_itineraries').insert({
      user_id: user.id,
      destination: suggestions?.destination || activeTrip?.destination,
      stage: 'suggestions',
      selected_places: pickedPlaces,
      trip_data: {
        destination: suggestions?.destination || activeTrip?.destination,
        flag: suggestions?.flag || activeTrip?.flag || '🌍',
        startDate: activeTrip?.startDate,
        duration: activeTrip?.duration,
        places: pickedPlaces,
      },
    });
    if (error) { setSavingList('error'); }
    else { setSavingList('saved'); }
    setTimeout(() => setSavingList(''), 3000);
  };

  const saveAsPDF = () => {
    const style = document.createElement('style');
    style.id = 'pdf-print-style';
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #itinerary-print-area, #itinerary-print-area * { visibility: visible; }
        #itinerary-print-area { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
        .day-card { page-break-inside: avoid; margin-bottom: 24px; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => { const el = document.getElementById('pdf-print-style'); if (el) el.remove(); }, 1000);
  };
  const [error, setError] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [globalStartPoint, setGlobalStartPoint] = useState('');
  const [dayStartPoints, setDayStartPoints] = useState({});
  const [showDayOverrides, setShowDayOverrides] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState('');

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    // Guests allowed — no redirect to login
    if (user) {
      setUser(user);
      await detectLatestTrip(user.id);
      // Check if plan buyer
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .limit(1);
      if (orders && orders.length > 0) setIsPlanBuyer(true);
      // Get itinerary search count
      const { data: logs } = await supabase
        .from('usage_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('action', 'itinerary_search');
      if (logs) setItineraryCount(logs.length);
    }
    setLoading(false);
  };

  const detectLatestTrip = async (userId) => {
    const { data: esimRows } = await supabase
      .from('esims')
      .select('country_name, country_flag, activated_at, validity_days, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    const esimData = esimRows?.[0] || null;

    const { data: orderRows } = await supabase
      .from('orders')
      .select('*, countries(name, flag_emoji)')
      .eq('user_id', userId)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1);
    const orderData = orderRows?.[0] || null;

    let trip = null;
    if (esimData && orderData) {
      trip = new Date(esimData.created_at) >= new Date(orderData.created_at)
        ? buildTripFromEsim(esimData) : buildTripFromOrder(orderData);
    } else if (esimData) {
      trip = buildTripFromEsim(esimData);
    } else if (orderData) {
      trip = buildTripFromOrder(orderData);
    }
    setDetectedTrip(trip);
  };

  const buildTripFromEsim = (e) => ({
    destination: e.country_name, flag: e.country_flag || '🌍',
    startDate: e.activated_at ? new Date(e.activated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    duration: e.validity_days || 7, source: 'eSIM',
  });

  const buildTripFromOrder = (o) => ({
    destination: o.countries?.name || 'Your destination', flag: o.countries?.flag_emoji || '🌍',
    startDate: o.paid_at ? new Date(o.paid_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    duration: 7, source: 'Order',
  });

  const proceedToInterests = async (trip) => {
    setActiveTrip(trip);
    setShowInterests(true);
    setShowManual(false);
    setLoadingExtra(true);
    try {
      const response = await fetch(CLAUDE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL, max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `For a trip to ${trip.destination}, suggest 3-5 destination-specific activity categories that are unique or especially relevant to this destination beyond generic categories like food, shopping, attractions. Return ONLY a JSON array, no other text, no markdown:
[{"id":"dest_1","label":"🎌 Example Category","desc":"Brief description"}]`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || '').join('');
      const clean = text.replace(/```json|```/g, '').trim();
      setExtraCategories(JSON.parse(clean));
    } catch (e) {
      setExtraCategories([]);
    }
    setLoadingExtra(false);
  };

  const toggleInterest = (id) => setSelectedInterests(prev => ({ ...prev, [id]: !prev[id] }));

  const selectedInterestLabels = () => {
    const all = [...STANDARD_CATEGORIES, ...extraCategories];
    return all.filter(c => selectedInterests[c.id]).map(c => c.label.replace(/^\S+\s/, '').trim());
  };

  const generateSuggestions = async () => {
    const interests = selectedInterestLabels();
    if (interests.length === 0) { setError('Please select at least one interest.'); return; }

    // ── Gate check ─────────────────────────────────────────────────────
    const allowed = await checkGate();
    if (!allowed) return;
    setError('');
    setGenerating(true);
    setSuggestions(null);
    setSelected({});
    setRoutedPlan(null);

    const start = new Date(activeTrip.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(activeTrip.duration) - 1);

    const prompt = `You are an expert travel curator. Generate a rich flat list of suggested places for a ${activeTrip.duration}-day trip to ${activeTrip.destination}. Interests: ${interests.join(', ')}. DO NOT group by day — return a flat list across all categories giving the user maximum choice. ${hotelAddress ? "The traveller is staying at: " + hotelAddress + "." : ""} Rules: 1. Only real verifiable establishments. 2. Prioritise UNESCO Michelin Tourism Board venues. 3. Never invent names or addresses. 4. Accurate lat/lng. 5. Note trust source. 6. Include meal options breakfast lunch dinner plus interest-specific venues. 7. Aim for ${Math.ceil(parseInt(activeTrip.duration) * 6)} suggestions. Return ONLY valid JSON no markdown: {"destination":"${activeTrip.destination}","flag":"🌏","disclaimer":"AI-generated from verified sources","places":[{"id":"p1","name":"Place Name","category":"Food & Dining","subcategory":"Breakfast","address":"Full address","desc":"Short description","duration":"1 hr","trustSource":"Michelin","lat":1.3521,"lng":103.8198}]}`;

    try {
      const response = await fetch(CLAUDE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, max_tokens: 8000, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || '').join('');
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      parsed.places?.forEach((item, i) => {
        if (item.coordinates && !item.lat) { item.lat = item.coordinates.lat; item.lng = item.coordinates.lng; }
        if (!item.id) item.id = 'p_' + i + '_' + Math.random().toString(36).substr(2,5);
        if (!item.address) item.address = item.name + ', ' + parsed.destination;
        if (!item.trustSource) item.trustSource = item.source || '';
        if (!item.desc) item.desc = item.type || '';
      });
      setSuggestions(parsed);
      const preSelected = {};
      parsed.places?.forEach(item => { preSelected[item.id] = true; });
      setSelected(preSelected);
    } catch (err) {
      setError('Failed to generate suggestions. Please try again.');
    }
    setGenerating(false);
  };

  const toggleItem = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const getMapMarkers = (data, useSelected = false) => {
    const markers = [];
    if (!data) return markers;
    data.days?.forEach(day => {
      Object.values(day.categories || {}).forEach(items => {
        items?.forEach(item => {
          if (item.lat && item.lng && (!useSelected || selected[item.id])) {
            markers.push({ ...item, day: day.day });
          }
        });
      });
    });
    return markers;
  };

  const getRouteMarkers = (plan) => {
    const markers = [];
    if (!plan) return markers;
    plan.days?.forEach(day => {
      day.stops?.forEach(stop => {
        if (stop.lat && stop.lng) markers.push({ ...stop, day: day.day });
      });
    });
    return markers;
  };

  const buildRoute = async () => {
    setRouting(true);
    setError('');
    const selectedItems = (suggestions?.places || []).filter(item => selected[item.id]);
    const start = new Date(activeTrip.startDate);
    const tripDays = parseInt(activeTrip.duration);
    const dateLabels = Array.from({ length: tripDays }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    });

    const prompt = `You are an expert travel routing AI. The user has selected ${selectedItems.length} places for a ${tripDays}-day trip to ${activeTrip.destination}.

${(globalStartPoint || hotelAddress) ? "Starting point (hotel): " + (globalStartPoint || hotelAddress) + ". For Day 1 first stop, calculate travel time from this hotel. " : ""}
Your job:
1. CLUSTER the selected places geographically — group nearby places to minimise travel within each day
2. SLOT each cluster into a day (${dateLabels.map((d,i)=>'Day '+(i+1)+' = '+d).join(', ')})
3. Within each day ORDER stops to minimise travel distance
4. Ensure logical daily flow — include a meal stop, spread activities evenly
5. Provide travel time and transport mode (Walk/MRT/Bus/Grab/Taxi) between each stop
6. Generate Google Maps URL per stop: https://www.google.com/maps/search/?api=1&query=PLACE+CITY

Selected places: ${JSON.stringify(selectedItems)}

Return ONLY valid JSON, no markdown:
{"destination":"${activeTrip.destination}","days":[{"day":1,"date":"${dateLabels[0]}","stops":[{"order":1,"name":"Place","category":"Food & Dining","address":"Full address","desc":"Description","duration":"1 hr","trustSource":"Source","travelFromPrev":null,"transportMode":null,"lat":1.3521,"lng":103.8198,"mapsUrl":"https://www.google.com/maps/search/?api=1&query=Place+City"}]}]}`;

    try {
      const response = await fetch(CLAUDE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, max_tokens: 8000, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || '').join('');
      const clean = text.replace(/```json|```/g, '').trim();
      setRoutedPlan(JSON.parse(clean));
      setActiveMapDay(null);
      setSuggestions(null);
    } catch (err) {
      setError('Failed to build route. Please try again.');
    }
    setRouting(false);
  };


  // Plan My Own state
  const [manualMode, setManualMode] = useState(false);
  const [basket, setBasket] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualCategory, setManualCategory] = useState('Attractions');
  const [buildingManualRoute, setBuildingManualRoute] = useState(false);

  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const dest = encodeURIComponent(activeTrip?.destination || '');
      const q = encodeURIComponent(searchQuery);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}+${dest}&format=json&limit=5&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      setSearchResults(data.map(r => ({
        name: r.name || r.display_name.split(',')[0],
        address: r.display_name,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        category: manualCategory,
      })));
    } catch (e) {
      setSearchResults([]);
    }
    setSearching(false);
  };

  const addToBasket = (place) => {
    const id = `manual_${Date.now()}`;
    setBasket(prev => [...prev, { ...place, id }]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const addManualToBasket = () => {
    if (!manualName.trim()) return;
    const id = `manual_${Date.now()}`;
    setBasket(prev => [...prev, {
      id, name: manualName, address: manualAddress,
      category: manualCategory, lat: null, lng: null,
    }]);
    setManualName('');
    setManualAddress('');
  };

  const removeFromBasket = (id) => setBasket(prev => prev.filter(i => i.id !== id));

  const buildManualRoute = async () => {
    if (basket.length === 0) return;
    setBuildingManualRoute(true);
    setError('');
    const prompt = `You are a travel routing expert. The user has selected these places for their trip to ${activeTrip?.destination || 'their destination'}.\nPlaces: ${JSON.stringify(basket)}\nCreate an optimised day-by-day route across ${activeTrip?.duration || 3} days. Order stops geographically. For each stop provide travel time and transport mode from previous stop and a Google Maps URL.\nReturn ONLY valid JSON no markdown: {"destination":"city","days":[{"day":1,"date":"Day 1","theme":"Theme","stops":[{"order":1,"name":"Place","category":"Category","address":"Address","desc":"description","duration":"1 hr","travelFromPrev":null,"transportMode":null,"lat":1.3521,"lng":103.8198,"mapsUrl":"https://www.google.com/maps/search/?api=1&query=Place"}]}]}`;
    try {
      const response = await fetch(CLAUDE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, max_tokens: 4000, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || '').join('');
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      // Fall back to original basket lat/lng if missing from route response
      parsed.days = parsed.days.map(day => ({
        ...day,
        stops: day.stops.map(stop => {
          if (!stop.lat || !stop.lng) {
            const original = basket.find(b => b.name === stop.name);
            if (original) { stop.lat = original.lat; stop.lng = original.lng; }
          }
          return stop;
        })
      }));
      setRoutedPlan(parsed);
      setManualMode(false);
    } catch (err) {
      setError('Failed to build route. Please try again.');
    }
    setBuildingManualRoute(false);
  };

  const transportIcons = { Walk: '🚶', MRT: '🚇', Metro: '🚇', Bus: '🚌', Taxi: '🚕', Grab: '🚗', Train: '🚆', 'Tuk-tuk': '🛺' };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '12px 16px', fontSize: '15px',
    color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: '13px', fontWeight: 600, color: 'var(--muted)' };
  const cardStyle = (selected) => ({
    display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer',
    padding: '12px 14px', borderRadius: '14px',
    background: selected ? 'rgba(0,200,255,0.08)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${selected ? 'rgba(0,200,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
    transition: 'all 0.15s',
  });

  if (loading) return <div className={styles.loadingPage}><div className={styles.spinner}></div></div>;


  const GateModal = () => (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    }}>
      <div style={{
        background: '#0d1117', border: '1px solid rgba(0,200,255,0.3)',
        borderRadius: '20px', padding: '36px', maxWidth: '420px', width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✈️</div>
        <h2 style={{ fontWeight: 900, marginBottom: '10px', fontSize: '22px' }}>
          {gateReason === 'guest' ? "You've used your 2 free searches!" : "You've used your 5 free searches!"}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
          {gateReason === 'guest'
            ? 'Register free to get 5 searches, or buy a data plan for unlimited itinerary planning.'
            : 'Buy a data plan to unlock unlimited itinerary planning — free forever with any purchase.'}
        </p>
        <div style={{
          background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.15)',
          borderRadius: '14px', padding: '16px', marginBottom: '24px', textAlign: 'left',
        }}>
          {gateReason === 'guest' && (
            <div style={{ marginBottom: '10px', fontSize: '13px', display: 'flex', gap: '10px' }}>
              <span>🆓</span><span><strong>Register free</strong> — get 5 searches + save trips</span>
            </div>
          )}
          <div style={{ marginBottom: '10px', fontSize: '13px', display: 'flex', gap: '10px' }}>
            <span>♾️</span><span><strong>Buy any data plan</strong> — unlimited searches forever</span>
          </div>
          <div style={{ marginBottom: '10px', fontSize: '13px', display: 'flex', gap: '10px' }}>
            <span>📱</span><span><strong>Re-download QR codes</strong> anytime from My Purchases</span>
          </div>
          <div style={{ fontSize: '13px', display: 'flex', gap: '10px' }}>
            <span>🧾</span><span><strong>Full order history</strong> — all eSIMs in one place</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => { setShowGateModal(false); navigate('/plans'); }} style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            border: 'none', borderRadius: '12px', padding: '14px',
            color: '#000', fontWeight: 800, fontSize: '15px', cursor: 'pointer',
          }}>Buy a Data Plan — Unlock Unlimited →</button>
          {gateReason === 'guest' && (
            <button onClick={() => { setShowGateModal(false); navigate('/register'); }} style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px', padding: '14px', color: 'inherit',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            }}>Register Free — Get 5 Searches</button>
          )}
          {gateReason === 'guest' && (
            <button onClick={() => { setShowGateModal(false); navigate('/login?redirect=/itinerary'); }} style={{
              background: 'none', border: 'none', color: 'var(--accent)',
              fontSize: '13px', cursor: 'pointer', padding: '4px',
              textDecoration: 'underline',
            }}>Already have an account? Sign In</button>
          )}
          <button onClick={() => setShowGateModal(false)} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: '13px', cursor: 'pointer', padding: '8px',
          }}>Maybe later</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <Navbar />
      {showGateModal && <GateModal />}
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Itinerary ✈️</h1>
            <p style={{ fontSize: '14px', color: 'var(--muted)' }}>AI-powered travel plans — verified places, real addresses, optimised routes</p>
          </div>
        </div>

        {/* STEP 1: Trip Selection */}
        {!showInterests && !generating && !suggestions && !routedPlan && (
          <>
            {detectedTrip && !showManual && (
              <div style={{ background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.2)', borderRadius: '20px', padding: '28px', marginBottom: '20px', maxWidth: '600px' }}>
                <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📍 Trip detected from your {detectedTrip.source}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '40px' }}>{detectedTrip.flag}</span>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '22px', fontFamily: 'var(--font-head)' }}>{detectedTrip.destination}</div>
                    <div style={{ fontSize: '14px', color: 'var(--muted)' }}>From {new Date(detectedTrip.startDate).toDateString()} · {detectedTrip.duration} days</div>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px' }}>Want me to plan this trip for you?</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button onClick={() => proceedToInterests(detectedTrip)} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#000', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-head)', cursor: 'pointer' }}>
                    Yes, plan this trip →
                  </button>
                  <button onClick={() => setShowManual(true)} style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 24px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                    Plan a different trip
                  </button>
                </div>
              </div>
            )}

            {(!detectedTrip || showManual) && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', maxWidth: '520px', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
                  {showManual ? 'Plan a Different Trip' : 'Plan a Trip'}
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); proceedToInterests({ destination, startDate, duration, flag: '🌍', hotelAddress }); }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={labelStyle}>Destination</label>
                    <input type="text" placeholder="e.g. Tokyo, Japan" value={destination} onChange={e => setDestination(e.target.value)} required style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={labelStyle}>Start Date</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={inputStyle} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={labelStyle}>Duration (days)</label>
                      <input type="number" placeholder="7" min="1" max="21" value={duration} onChange={e => setDuration(e.target.value)} required style={inputStyle} />
                    </div>
                  </div>

                  <button type="submit" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#000', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 800, fontSize: '15px', fontFamily: 'var(--font-head)', cursor: 'pointer' }}>
                    Next: Choose Interests →
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* STEP 2: Interest Selection */}
        {showInterests && !generating && !suggestions && (
          <div style={{ maxWidth: '680px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>
                What are you into? {activeTrip?.flag}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Select your interests — we'll suggest verified, accredited places for {activeTrip?.destination}.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Standard Categories</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {STANDARD_CATEGORIES.map(cat => (
                  <label key={cat.id} style={cardStyle(selectedInterests[cat.id])}>
                    <input type="checkbox" checked={!!selectedInterests[cat.id]} onChange={() => toggleInterest(cat.id)}
                      style={{ marginTop: '2px', accentColor: 'var(--accent)', width: '15px', height: '15px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{cat.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{cat.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                {loadingExtra ? '⏳ Loading destination-specific categories...' : `✨ Unique to ${activeTrip?.destination}`}
              </div>
              {!loadingExtra && extraCategories.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {extraCategories.map(cat => (
                    <label key={cat.id} style={cardStyle(selectedInterests[cat.id])}>
                      <input type="checkbox" checked={!!selectedInterests[cat.id]} onChange={() => toggleInterest(cat.id)}
                        style={{ marginTop: '2px', accentColor: 'var(--accent)', width: '15px', height: '15px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{cat.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{cat.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {error && <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff6b6b', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => { setShowInterests(false); setExtraCategories([]); setError(''); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '12px', padding: '12px 20px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>← Back</button>
              <button onClick={generateSuggestions} disabled={Object.values(selectedInterests).filter(Boolean).length === 0}
                style={{ background: Object.values(selectedInterests).filter(Boolean).length === 0 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--accent), var(--accent2))', color: Object.values(selectedInterests).filter(Boolean).length === 0 ? 'var(--muted)' : '#000', border: 'none', borderRadius: '12px', padding: '12px 28px', fontWeight: 800, fontSize: '15px', fontFamily: 'var(--font-head)', cursor: Object.values(selectedInterests).filter(Boolean).length === 0 ? 'not-allowed' : 'pointer' }}>
                Generate Suggestions →
              </button>
            </div>
          </div>
        )}

        {/* Generating spinner */}
        {generating && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div className={styles.spinner} style={{ margin: '0 auto 20px' }}></div>
            <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Finding verified places in {activeTrip?.destination}...</p>
          </div>
        )}

        {/* STEP 3: Suggestions + Map */}
        {suggestions && !routedPlan && !routing && (() => {
          const allPlaces = suggestions.places || [];
          const categories = [...new Set(allPlaces.map(p => p.category))];
          const selectedMarkers = allPlaces.filter(p => p.lat && p.lng);
          return (
          <div style={{ maxWidth: '760px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 900 }}>{suggestions.flag} {suggestions.destination} — Pick Your Places</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Tick what you want · Claude will cluster & optimise your route</p>
              </div>
              <button onClick={() => { setSuggestions(null); setShowInterests(true); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>← Back to Interests</button>
            </div>

            <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '12px', padding: '10px 14px', fontSize: '12px', color: 'rgba(245,166,35,0.9)', marginBottom: '20px' }}>
              ℹ️ {suggestions.disclaimer}
            </div>

            {selectedMarkers.length > 0 && (
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '24px', height: '320px' }}>
                <MapContainer center={[selectedMarkers[0].lat, selectedMarkers[0].lng]} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                  <MapBounds markers={selectedMarkers} />
                  {selectedMarkers.map((m, i) => (
                    <Marker key={m.id || i} position={[m.lat, m.lng]} icon={NumberedIcon(i + 1, 1)}>
                      <Popup><strong>{m.name}</strong><br /><span style={{ fontSize: '11px', color: '#666' }}>{m.address}</span></Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button onClick={() => { const all = {}; allPlaces.forEach(p => { all[p.id] = true; }); setSelected(all); }} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Select All</button>
              <button onClick={() => setSelected({})} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Deselect All</button>
            </div>

            <AddPlaceSearch
              activeTrip={activeTrip}
              onAdd={(place) => {
                setSuggestions(prev => ({ ...prev, places: [...(prev.places || []), place] }));
                setSelected(prev => ({ ...prev, [place.id]: true }));
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
              {categories.map(cat => {
                const items = allPlaces.filter(p => p.category === cat);
                return (
                  <div key={cat} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
                    <div style={{ background: 'rgba(0,200,255,0.06)', borderBottom: '1px solid var(--border)', padding: '12px 20px', fontSize: '12px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>{cat}</div>
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {items.map(item => (
                        <label key={item.id} style={cardStyle(selected[item.id])}>
                          <input type="checkbox" checked={!!selected[item.id]} onChange={() => toggleItem(item.id)} style={{ marginTop: '3px', accentColor: 'var(--accent)', width: '16px', height: '16px', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                              <div style={{ fontWeight: 700, fontSize: '14px' }}>
                                {item.name}
                                {item.subcategory && <span style={{ fontWeight: 400, color: 'var(--accent)', fontSize: '11px', marginLeft: '8px', background: 'rgba(0,200,255,0.1)', borderRadius: '4px', padding: '1px 6px' }}>{item.subcategory}</span>}
                                {item.duration && <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '12px', marginLeft: '8px' }}>· {item.duration}</span>}
                              </div>
                              {item.trustSource && <span style={{ fontSize: '10px', background: 'rgba(76,217,100,0.1)', color: '#4cd964', border: '1px solid rgba(76,217,100,0.2)', borderRadius: '6px', padding: '2px 7px', whiteSpace: 'nowrap', fontWeight: 700 }}>✓ {item.trustSource}</span>}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '3px' }}>{item.desc}</div>
                            {item.address && <div style={{ fontSize: '11px', color: 'var(--muted2)', marginTop: '4px' }}>📍 {item.address}</div>}
                            <div style={{ marginTop: '6px' }}><a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(item.name + ' ' + (item.address || ''))} target='_blank' rel='noopener noreferrer' style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, background: 'rgba(0,200,255,0.08)', border: '1px solid rgba(0,200,255,0.2)', borderRadius: '6px', padding: '2px 8px' }}>View on Maps</a></div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Start Point + Save List + Build Route ── */}
            <div style={{ marginTop: '24px', background: 'rgba(10,15,26,0.95)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px', backdropFilter: 'blur(20px)' }}>
              {/* Save picked places */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  <span style={{ color: 'var(--text)', fontWeight: 700 }}>{selectedCount}</span> places selected · Claude will cluster & sort into <span style={{ color: 'var(--text)', fontWeight: 700 }}>{activeTrip && activeTrip.duration}</span> days
                </div>
                <button onClick={savePickedPlaces} disabled={selectedCount === 0} style={{
                  background: selectedCount === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,200,255,0.1)',
                  border: '1px solid ' + (selectedCount === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(0,200,255,0.3)'),
                  color: selectedCount === 0 ? 'var(--muted)' : 'var(--accent)',
                  borderRadius: '10px', padding: '8px 18px', fontWeight: 700, fontSize: '13px', cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
                }}>
                  {savingList === 'saving' ? '⏳ Saving...' : savingList === 'saved' ? '✅ Saved!' : savingList === 'error' ? '❌ Error' : '💾 Save List'}
                </button>
              </div>
              {/* Global Start Point */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: 'var(--accent)' }}>🏨 Where are you staying? <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional — improves routing)</span></div>
                <input type="text" placeholder="e.g. Marina Bay Sands, Singapore"
                  value={globalStartPoint} onChange={e => setGlobalStartPoint(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: 'inherit', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px' }}
                />
                <div onClick={() => setShowDayOverrides(!showDayOverrides)}
                  style={{ fontSize: '12px', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {showDayOverrides ? '▲' : '▼'} Set different start point per day (optional)
                </div>
                {showDayOverrides && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Array.from({ length: parseInt(activeTrip?.duration || 1) }, (_, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--muted)', minWidth: '45px' }}>Day {i+1}</span>
                        <input type="text" placeholder={`Override for Day ${i+1} (leave blank to use global)`}
                          value={dayStartPoints[i+1] || ''} onChange={e => setDayStartPoints(prev => ({ ...prev, [i+1]: e.target.value }))}
                          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'inherit', fontSize: '13px' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Build Route button */}
              <button onClick={buildRoute} disabled={selectedCount === 0} style={{
                width: '100%', background: selectedCount === 0 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--accent), var(--accent2))',
                color: selectedCount === 0 ? 'var(--muted)' : '#000', border: 'none', borderRadius: '12px',
                padding: '14px 24px', fontWeight: 800, fontSize: '15px', fontFamily: 'var(--font-head)',
                cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
              }}>
                {selectedCount === 0 ? 'Select places to build your route' : `Build My Route → (${selectedCount} places)`}
              </button>
            </div>
          </div>
          );
        })()}

                {/* Plan My Own */}
        {manualMode && !buildingManualRoute && !routedPlan && (
          <div style={{ maxWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 900 }}>✏️ Plan My Own Trip</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Search or add places — build your basket, then route it</p>
              </div>
              <button onClick={() => { setManualMode(false); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>← Back</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Category</label>
              <select value={manualCategory} onChange={e => setManualCategory(e.target.value)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', color: 'var(--text)', outline: 'none' }}>
                {['Food & Dining', 'Shopping Malls', 'Specialty Shops', 'Attractions', 'Nature & Parks', 'Culture & Arts', 'Nightlife', 'Wellness & Spas', 'Sports & Activities', 'Transport', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Search a Place</div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <input type="text" placeholder={`Search in ${activeTrip?.destination || 'destination'}...`}
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchPlaces()}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', color: 'var(--text)', outline: 'none' }} />
                <button onClick={searchPlaces} disabled={searching} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#000', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}>
                  {searching ? '...' : 'Search'}
                </button>
              </div>
              {searchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {searchResults.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{r.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>📍 {r.address}</div>
                      </div>
                      <button onClick={() => addToBasket(r)} style={{ background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.25)', color: 'var(--accent)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Add Manually</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Place name" value={manualName} onChange={e => setManualName(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', color: 'var(--text)', outline: 'none' }} />
                <input type="text" placeholder="Address (optional)" value={manualAddress} onChange={e => setManualAddress(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', color: 'var(--text)', outline: 'none' }} />
                <button onClick={addManualToBasket} disabled={!manualName.trim()} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>+ Add to Basket</button>
              </div>
            </div>

            {basket.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  Your Basket — {basket.length} place{basket.length !== 1 ? 's' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {basket.map((item, i) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.15)', borderRadius: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: 'var(--accent)', color: '#000', borderRadius: '6px', padding: '1px 8px', fontSize: '11px', fontWeight: 800 }}>{i + 1}</span>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>{item.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--muted)', background: 'rgba(255,255,255,0.06)', padding: '1px 8px', borderRadius: '6px' }}>{item.category}</span>
                        </div>
                        {item.address && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>📍 {item.address}</div>}
                      </div>
                      <button onClick={() => removeFromBasket(item.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '16px', cursor: 'pointer', padding: '0 4px' }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ position: 'sticky', bottom: '24px', background: 'rgba(10,15,26,0.95)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                <span style={{ color: 'var(--text)', fontWeight: 700 }}>{basket.length}</span> places in basket
              </div>
              <button onClick={buildManualRoute} disabled={basket.length === 0} style={{ background: basket.length === 0 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--accent), var(--accent2))', color: basket.length === 0 ? 'var(--muted)' : '#000', border: 'none', borderRadius: '10px', padding: '10px 24px', fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-head)', cursor: basket.length === 0 ? 'not-allowed' : 'pointer' }}>
                Plan My Route →
              </button>
            </div>
          </div>
        )}

        {buildingManualRoute && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div className={styles.spinner} style={{ margin: '0 auto 20px' }}></div>
            <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Building your custom route...</p>
          </div>
        )}
        {/* Routing spinner */}
        {routing && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div className={styles.spinner} style={{ margin: '0 auto 20px' }}></div>
            <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Optimising your route for {activeTrip?.destination}...</p>
          </div>
        )}

        {/* STEP 5: Routed Plan + Map */}
        {routedPlan && (
          <div style={{ maxWidth: '760px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 900 }}>{activeTrip?.flag || '✈️'} {routedPlan.destination} — Your Route</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Stops ordered and optimised · tap 📍 Maps for navigation</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setRoutedPlan(null); setSuggestions(suggestions); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>← Edit Selection</button>
                <button onClick={() => { setRoutedPlan(null); setSuggestions(suggestions); buildRoute(); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--accent)', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🔄 Re-Build</button>
                <button onClick={saveItinerary} style={{ background: savedStatus === 'saved' ? 'rgba(76,217,100,0.15)' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (savedStatus === 'saved' ? 'rgba(76,217,100,0.4)' : 'var(--border)'), color: savedStatus === 'saved' ? '#4cd964' : savedStatus === 'error' ? '#ff6b6b' : 'var(--muted)', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  {savedStatus === 'saving' ? '⏳ Saving...' : savedStatus === 'saved' ? '✓ Saved!' : savedStatus === 'error' ? '❌ Error' : savedStatus === 'Login to save' ? '🔒 Login to Save' : '💾 Save'}
                </button>
                <button onClick={() => { if (!user) { setGateReason('guest'); setShowGateModal(true); } else { saveAsPDF(); } }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>📄 Save PDF</button>
                <button onClick={() => { if (!user) { setGateReason('guest'); setShowGateModal(true); } else { const text = routedPlan.days.map(d => 'Day ' + d.day + ': ' + d.theme + '\n' + (d.stops || []).map(s => s.order + '. ' + s.name + ' - ' + s.address).join('\n')).join('\n\n'); navigator.clipboard.writeText(text).then(() => alert('Itinerary copied!')); } }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>📋 Copy</button>

                <button onClick={() => { setSuggestions(null); setRoutedPlan(null); setShowInterests(false); setShowManual(false); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Start Over</button>
              </div>
            </div>

            {/* Map Step 5 - Interactive Day Filter */}
            {(() => {
              const allMarkers = getRouteMarkers(routedPlan);
              if (allMarkers.length === 0) return null;
              const days = routedPlan.days || [];
              return (
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveMapDay(null)} style={{ background: activeMapDay === null ? 'var(--accent)' : 'rgba(255,255,255,0.06)', color: activeMapDay === null ? '#000' : 'var(--muted)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>All Days</button>
                    {days.map(day => (
                      <button key={day.day} onClick={() => setActiveMapDay(day.day)} style={{ background: activeMapDay === day.day ? DAY_COLORS[(day.day-1) % DAY_COLORS.length] : 'rgba(255,255,255,0.06)', color: activeMapDay === day.day ? '#000' : 'var(--muted)', border: '1px solid ' + (activeMapDay === day.day ? DAY_COLORS[(day.day-1) % DAY_COLORS.length] : 'var(--border)'), borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Day {day.day}</button>
                    ))}
                  </div>
                  {(() => {
                    const filtered = activeMapDay === null ? allMarkers : allMarkers.filter(m => m.day === activeMapDay);
                    if (filtered.length === 0) return null;
                    const borderColor = activeMapDay === null ? 'var(--border)' : DAY_COLORS[(activeMapDay-1) % DAY_COLORS.length];
                    return (
                      <div style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid ' + borderColor, height: '360px' }}>
                        <MapContainer key={'map_' + activeMapDay} center={[filtered[0].lat, filtered[0].lng]} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                          <MapBounds markers={filtered} />
                          {filtered.map((m, i) => (
                            <Marker key={i} position={[m.lat, m.lng]} icon={NumberedIcon(m.order || i+1, m.day || 1)}>
                              <Popup>
                                <strong>Stop {m.order}: {m.name}</strong><br />
                                <span style={{ fontSize: '11px', color: '#666' }}>{m.address}</span><br />
                                {m.mapsUrl && <a href={m.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px' }}>Open in Maps</a>}
                              </Popup>
                            </Marker>
                          ))}
                        </MapContainer>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            <div id="itinerary-print-area" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {routedPlan.days?.map(day => (
                <div key={day.day} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
                  <div style={{ background: 'rgba(0,200,255,0.08)', borderBottom: '1px solid var(--border)', borderLeft: `4px solid ${DAY_COLORS[(day.day - 1) % DAY_COLORS.length]}`, padding: '14px 24px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ background: DAY_COLORS[(day.day - 1) % DAY_COLORS.length], color: '#000', borderRadius: '8px', padding: '2px 10px', fontSize: '12px', fontWeight: 800 }}>Day {day.day}</span>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{day.date}</span>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{day.theme}</span>
                  </div>
                  <div style={{ padding: '20px 24px' }}>
                    {day.stops?.map((stop, idx) => (
                      <div key={idx}>
                        {stop.travelFromPrev && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0 6px 18px', color: 'var(--muted)', fontSize: '12px' }}>
                            <div style={{ width: '1px', height: '18px', background: 'var(--border)', marginRight: '4px' }}></div>
                            {transportIcons[stop.transportMode] || '🚗'} {stop.transportMode} · {stop.travelFromPrev}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>{stop.order}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '15px' }}>{stop.name}{stop.duration && <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '12px', marginLeft: '8px' }}>· {stop.duration}</span>}</div>
                                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>{stop.desc}</div>
                                {stop.address && <div style={{ fontSize: '11px', color: 'var(--muted2)', marginTop: '4px' }}>📍 {stop.address}</div>}
                                {stop.trustSource && <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '10px', background: 'rgba(76,217,100,0.1)', color: '#4cd964', border: '1px solid rgba(76,217,100,0.2)', borderRadius: '6px', padding: '2px 7px', fontWeight: 700 }}>✓ {stop.trustSource}</span>}
                              </div>
                              <a href={stop.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.25)', color: 'var(--accent)', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>📍 Maps</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
              ℹ️ {suggestions?.disclaimer || 'Always verify opening hours and availability before visiting.'}
            </div>
          </div>
        )}

        {error && !generating && !showInterests && (
          <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff6b6b', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', marginTop: '20px', maxWidth: '600px' }}>{error}</div>
        )}

      </main>
    </div>
  );
}