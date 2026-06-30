import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Approximate coordinates for our 10 cities - Leaflet uses [Lat, Lng]
const markers = {
  "Cairo": [30.0444, 31.2357],
  "Alexandria": [31.2001, 29.9187],
  "Aswan": [24.0889, 32.8998],
  "Hurghada": [27.2579, 33.8116],
  "Giza": [30.0131, 31.2089],
  "Tanta": [30.7865, 31.0016],
  "Mansoura": [31.0364, 31.3785],
  "Sohag": [26.5570, 31.6917],
  "Damanhur": [31.0300, 30.4700],
  "Port Said": [31.2565, 32.2841]
};

// Custom glowing beacon icon using divIcon
const beaconIcon = new L.DivIcon({
  className: 'glowing-beacon-container',
  html: '<div class="glowing-beacon"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Cities() {
  const [metrics, setMetrics] = useState([]);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, data: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/metrics`).then(res => res.json()).then(data => setMetrics(data));
  }, []);

  const handleMouseMove = (e, city) => {
    const data = metrics.find(m => m.city.toLowerCase() === city.toLowerCase());
    setTooltip({
      show: true,
      x: e.clientX,
      y: e.clientY,
      data
    });
  };

  const handleMouseLeave = () => {
    setTooltip(t => ({ ...t, show: false }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{ position: 'relative', width: '100%', minHeight: '80vh' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>Central <span style={{ color: 'var(--accent)' }}>Command Map</span></h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Hover over a beacon for live telemetry. Click to open deep dive profile.</p>
      </div>

      <div style={{ width: '100%', height: '600px', display: 'flex', justifyContent: 'center' }}>
        <MapContainer 
          center={[26.8, 30.8]} 
          zoom={6} 
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', borderRadius: '16px', background: '#0a0a0a' }}
        >
          {/* CartoDB Dark Matter tile layer for that sleek sci-fi / cinematic look */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />

          {Object.entries(markers).map(([name, coordinates]) => (
            <Marker 
              key={name} 
              position={coordinates}
              icon={beaconIcon}
              eventHandlers={{
                mouseover: (e) => handleMouseMove(e.originalEvent, name),
                mouseout: handleMouseLeave,
                click: () => navigate(`/city/${name.toLowerCase()}`)
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Floating Glass Tooltip */}
      {tooltip.show && tooltip.data && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="glass-panel"
          style={{
            position: 'fixed',
            left: tooltip.x + 20,
            top: tooltip.y - 40,
            padding: '1.2rem',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            minWidth: '150px'
          }}
        >
          <h4 style={{ margin: 0, color: 'var(--accent)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>{tooltip.data.city}</h4>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{(tooltip.data.current_temperature ?? tooltip.data.avg_temperature_C).toFixed(1)}°C</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>AQI: {(tooltip.data.current_aqi ?? tooltip.data.avg_USAQI).toFixed(0)}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Comfort: {tooltip.data.metrics?.comfort_score ?? tooltip.data.comfort_score}/100</p>
        </motion.div>
      )}
    </motion.div>
  );
}
