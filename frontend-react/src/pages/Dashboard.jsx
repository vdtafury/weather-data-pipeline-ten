import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Sparkles, Clock, AlertTriangle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Dashboard() {
  const [summary, setSummary] = useState("Generating smart briefing...");
  const [metrics, setMetrics] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [cityForTime, setCityForTime] = useState('');
  const [optimalTime, setOptimalTime] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/summary`).then(res => res.json()).then(data => setSummary(data.summary));
    fetch(`${API_BASE}/metrics`).then(res => res.json()).then(data => setMetrics(data));
    fetch(`${API_BASE}/forecast`).then(res => res.json()).then(data => setForecast(data));

    // Setup SSE Connection for Real-Time Kafka Data
    const eventSource = new EventSource(`${API_BASE}/stream/metrics`);
    eventSource.onmessage = (event) => {
      const updates = JSON.parse(event.data);
      setMetrics((prevMetrics) => {
        const newMetrics = [...prevMetrics];
        updates.forEach(update => {
          const index = newMetrics.findIndex(m => m.city === update.city);
          if (index !== -1) {
            newMetrics[index] = update;
          } else {
            newMetrics.push(update);
          }
        });
        return newMetrics;
      });
    };

    return () => eventSource.close();
  }, []);

  const handleOptimalTime = async () => {
    if (!cityForTime) {
      setOptimalTime('Please select a city first.');
      return;
    }
    setOptimalTime('Analyzing 24-hour forecast matrices...');
    try {
      const res = await fetch(`${API_BASE}/optimal-time?city=${cityForTime}`);
      const data = await res.json();
      setOptimalTime(data.error || data.message);
    } catch {
      setOptimalTime('Connection error.');
    }
  };

  const getChartData = () => {
    const citiesToPlot = ['Cairo', 'Alexandria', 'Aswan'];
    const cairoData = forecast.filter(d => d.city === 'Cairo').slice(0, 24);
    const labels = cairoData.map(d => d.hour);

    const datasets = citiesToPlot.map((city, index) => {
      const cityData = forecast.filter(d => d.city === city).slice(0, 24);
      const colors = ['#d4af37', '#4a90e2', '#e74c3c'];
      return {
        label: city,
        data: cityData.map(d => d['temperature_°C']),
        borderColor: colors[index],
        backgroundColor: colors[index] + '20',
        fill: true,
        tension: 0.4
      };
    });
    return { labels, datasets };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
    >
      {/* AI Summary */}
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent)' }}>
        <Sparkles color="var(--accent)" size={32} />
        <p style={{ fontSize: '1.1rem', lineHeight: 1.5, fontWeight: 300 }}>{summary}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Optimal Time Widget */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Clock color="var(--accent)" />
            <h2 style={{ fontSize: '1.5rem' }}>Optimal Time Finder</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Discover the best 2-hour window for outdoor activities.</p>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <select style={{ flex: 1 }} value={cityForTime} onChange={(e) => setCityForTime(e.target.value)}>
              <option value="">Select a City</option>
              <option value="Cairo">Cairo</option>
              <option value="Alexandria">Alexandria</option>
              <option value="Aswan">Aswan</option>
              <option value="Hurghada">Hurghada</option>
            </select>
            <button className="action-btn" onClick={handleOptimalTime} style={{ padding: '0.8rem 1.5rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Analyze</button>
          </div>
          <p style={{ color: 'var(--accent)', fontWeight: 600, minHeight: '3rem' }}>{optimalTime}</p>
        </div>

        {/* Chart */}
        <div className="glass-panel" style={{ padding: '2rem', height: '400px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Temperature Forecast (24h)</h2>
          {forecast.length > 0 && <Line data={getChartData()} options={{ 
            maintainAspectRatio: false, 
            color: '#fff',
            interaction: { mode: 'index', intersect: false },
            plugins: {
              tooltip: {
                backgroundColor: 'rgba(10, 10, 10, 0.85)',
                titleColor: '#d4af37',
                titleFont: { size: 14, weight: 'bold', family: 'Outfit' },
                bodyColor: '#e2e8f0',
                bodyFont: { size: 13, family: 'Outfit' },
                borderColor: 'rgba(212, 175, 55, 0.3)',
                borderWidth: 1,
                padding: 16,
                caretSize: 0,
                usePointStyle: true,
                boxPadding: 6,
                animation: { duration: 150 } // Extremely smooth tracking
              },
              legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { family: 'Outfit' } } }
            },
            scales: { x: { grid: { color: 'rgba(255,255,255,0.05)'} }, y: { grid: { color: 'rgba(255,255,255,0.05)'} } },
            elements: { point: { radius: 0, hitRadius: 20, hoverRadius: 6 }, line: { tension: 0.4 } }
          }} />}
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem' }}>Live Engine Metrics</h2>
        <motion.span 
          animate={{ opacity: [1, 0.5, 1] }} 
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ background: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <div style={{ width: '8px', height: '8px', background: '#e74c3c', borderRadius: '50%' }}></div>
          KAFKA STREAM
        </motion.span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {metrics.map(city => {
          // Safeguard: handle both old fallback format and new kafka format
          const temp = city.current_temperature ?? city.avg_temperature_C;
          const aqi = city.current_aqi ?? city.avg_USAQI;
          const humidity = city.current_humidity ?? city.avg_humidity_percent ?? 50;
          const comfort = city.metrics?.comfort_score ?? city.comfort_score;
          const cdd = city.metrics?.cooling_degree_days ?? city.cdd;
          const energyWarning = city.metrics?.energy_warning ?? city.energy_warning;

          return (
            <div key={city.city} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.4rem' }}>{city.city}</h3>
                <span style={{ padding: '0.3rem 0.8rem', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--accent)', borderRadius: '20px', fontWeight: 800 }}>
                  {temp?.toFixed(1)}°C
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Air Quality (US)</span>
                <span>{aqi?.toFixed(0)} AQI</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Humidity</span>
                <span>{humidity?.toFixed(0)}%</span>
              </div>
              
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>Comfort Score</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{comfort}/100</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${comfort}%` }} transition={{ duration: 1, delay: 0.5 }} style={{ height: '100%', background: 'var(--accent)' }} />
                </div>
              </div>

              {energyWarning && (
                <div style={{ marginTop: '1rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  <AlertTriangle size={16} /> High Energy Load (CDD: {cdd})
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
