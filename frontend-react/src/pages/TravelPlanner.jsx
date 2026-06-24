import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const cities = ["Cairo", "Alexandria", "Aswan", "Hurghada", "Giza", "Tanta", "Mansoura", "Sohag", "Damanhur", "Port Said"];

export default function TravelPlanner() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePlan = async () => {
    if (!start || !end || start === end) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/route-planner?start=${start}&end=${end}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Connection error." });
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }}>Smart <span style={{ color: 'var(--accent)' }}>Travel Planner</span></h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.2rem' }}>Plan your route safely by analyzing meteorological differences between your origin and destination.</p>

      <div className="glass-panel" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '2rem', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <select value={start} onChange={e => setStart(e.target.value)} style={{ flex: 1, padding: '1.2rem', fontSize: '1.1rem' }}>
            <option value="">Origin City</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Navigation color="var(--accent)" size={40} style={{ transform: 'rotate(90deg)' }} />
          <select value={end} onChange={e => setEnd(e.target.value)} style={{ flex: 1, padding: '1.2rem', fontSize: '1.1rem' }}>
            <option value="">Destination City</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button className="action-btn" onClick={handlePlan} style={{ padding: '1rem 3rem', fontSize: '1.2rem', width: '50%' }}>
          {loading ? 'Analyzing Route...' : 'Generate Advisory'}
        </button>
      </div>

      {result && !result.error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ marginTop: '3rem', padding: '3rem', textAlign: 'left', borderLeft: '4px solid var(--accent)' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Travel Advisory</h2>
          <p style={{ fontSize: '1.3rem', lineHeight: 1.6, color: '#fff' }}>{result.advisory}</p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem' }}>
            <div style={{ flex: 1, padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--accent)', paddingBottom: '0.5rem' }}>{result.start.city} (Origin)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Temp: <span style={{color: '#fff'}}>{result.start.avg_temperature_C.toFixed(1)}°C</span></p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>AQI: <span style={{color: '#fff'}}>{result.start.avg_USAQI.toFixed(0)}</span></p>
            </div>
            <div style={{ flex: 1, padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--accent)', paddingBottom: '0.5rem' }}>{result.end.city} (Destination)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Temp: <span style={{color: '#fff'}}>{result.end.avg_temperature_C.toFixed(1)}°C</span></p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>AQI: <span style={{color: '#fff'}}>{result.end.avg_USAQI.toFixed(0)}</span></p>
            </div>
          </div>
        </motion.div>
      )}
      {result && result.error && (
        <div style={{ marginTop: '2rem', color: '#e74c3c', fontSize: '1.2rem' }}>{result.error}</div>
      )}
    </motion.div>
  );
}
