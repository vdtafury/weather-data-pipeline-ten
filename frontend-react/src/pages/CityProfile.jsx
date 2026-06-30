import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Thermometer, Wind, Droplets } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import DynamicBackground from '../components/DynamicBackground';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function CityProfile() {
  const { name } = useParams();
  const [cityMetrics, setCityMetrics] = useState(null);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [metricsRes, forecastRes] = await Promise.all([
        fetch(`${API_BASE}/metrics`),
        fetch(`${API_BASE}/forecast`)
      ]);
      const metricsData = await metricsRes.json();
      const forecastData = await forecastRes.json();
      
      const foundCity = metricsData.find(c => c.city.toLowerCase() === name);
      setCityMetrics(foundCity);
      
      const cityForecast = forecastData.filter(d => d.city.toLowerCase() === name).slice(0, 24);
      setForecast(cityForecast);
    };
    fetchData();
  }, [name]);

  if (!cityMetrics) return <div style={{ textAlign: 'center', marginTop: '5rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading Cinematic Profile...</div>;

  const chartData = {
    labels: forecast.map(f => f.hour),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: forecast.map(f => f['temperature_°C']),
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#d4af37'
      }
    ]
  };

  return (
    <>
      <DynamicBackground temp={cityMetrics.current_temperature ?? cityMetrics.avg_temperature_C} humidity={cityMetrics.current_humidity ?? cityMetrics.avg_humidity_percent ?? 50} />
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
      >
      <Link to="/cities" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem', width: 'fit-content', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
        <ArrowLeft size={16} /> Back to Archive
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1, color: '#fff' }}>{cityMetrics.city}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Deep Dive Analytics Profile</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{(cityMetrics.current_temperature ?? cityMetrics.avg_temperature_C).toFixed(1)}°</div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Current Average</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(212,175,55,0.1)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}><Thermometer color="var(--accent)" size={32} /></div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Temperature Range</p>
            <h3 style={{ fontSize: '1.8rem', color: '#fff' }}>{cityMetrics.min_temperature ?? cityMetrics.min_temperature_C}° - {cityMetrics.max_temperature ?? cityMetrics.max_temperature_C}°</h3>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(212,175,55,0.1)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}><Droplets color="var(--accent)" size={32} /></div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Humidity Level</p>
            <h3 style={{ fontSize: '1.8rem', color: '#fff' }}>{(cityMetrics.current_humidity ?? cityMetrics.avg_humidity_percent ?? 50).toFixed(0)}%</h3>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(212,175,55,0.1)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}><Wind color="var(--accent)" size={32} /></div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Air Quality (AQI)</p>
            <h3 style={{ fontSize: '1.8rem', color: '#fff' }}>{(cityMetrics.current_aqi ?? cityMetrics.avg_USAQI).toFixed(0)}</h3>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', height: '500px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#fff' }}>24-Hour Forecast Trajectory</h2>
        <Line data={chartData} options={{ 
          maintainAspectRatio: false, 
          color: '#fff', 
          interaction: { mode: 'index', intersect: false },
          plugins: { 
            legend: { display: false }, 
            tooltip: {
              backgroundColor: 'rgba(10, 10, 10, 0.85)',
              titleColor: '#d4af37',
              titleFont: { size: 16, weight: 'bold', family: 'Outfit' },
              bodyColor: '#fff',
              bodyFont: { size: 15, family: 'Outfit' },
              borderColor: 'rgba(212, 175, 55, 0.4)',
              borderWidth: 1,
              padding: 16,
              caretSize: 0,
              displayColors: false,
              animation: { duration: 150 }
            } 
          }, 
          scales: { x: { grid: { color: 'rgba(255,255,255,0.05)'} }, y: { grid: { color: 'rgba(255,255,255,0.05)'} } },
          elements: { point: { radius: 0, hitRadius: 30, hoverRadius: 8, hoverBackgroundColor: '#d4af37', hoverBorderColor: '#fff', hoverBorderWidth: 2 }, line: { tension: 0.4 } }
        }} />
      </div>
    </motion.div>
    </>
  );
}
