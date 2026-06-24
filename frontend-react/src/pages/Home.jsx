import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ArrowRight, Wind, Activity, Zap } from 'lucide-react';

export default function Home() {
  const heroRef = useRef(null);

  useEffect(() => {
    // GSAP parallax floating effect
    gsap.to(heroRef.current, {
      y: 15,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut"
    });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', textAlign: 'center' }}
    >
      <div ref={heroRef} style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '5.5rem', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Data <span style={{ color: 'var(--accent)' }}>Reimagined.</span>
        </h1>
        <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
          A cinematic ETL pipeline delivering real-time meteorological analytics, comfort scoring, and energy load predictions across Egypt.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '5rem' }}>
        <Link to="/dashboard" style={{ padding: '1.2rem 3rem', background: 'var(--accent)', color: '#000', textDecoration: 'none', borderRadius: '40px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          Enter Dashboard <ArrowRight size={20}/>
        </Link>
        <Link to="/cities" style={{ padding: '1.2rem 3rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', borderRadius: '40px', fontWeight: 600, fontSize: '1.1rem', transition: 'all 0.3s' }} onMouseEnter={e => {e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'}} onMouseLeave={e => {e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'}}>
          Explore Cities Archive
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'left' }}>
          <Wind color="var(--accent)" size={36} style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ marginBottom: '0.8rem', fontSize: '1.4rem' }}>Automated Extraction</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>Batched API requests and intelligent caching for high-speed data retrieval.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'left' }}>
          <Activity color="var(--accent)" size={36} style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ marginBottom: '0.8rem', fontSize: '1.4rem' }}>Smart Analytics</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>Real-time Comfort Scores and AI-generated natural language briefings.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'left' }}>
          <Zap color="var(--accent)" size={36} style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ marginBottom: '0.8rem', fontSize: '1.4rem' }}>Energy Monitoring</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>Cooling Degree Days (CDD) calculations for grid load prediction.</p>
        </div>
      </div>
    </motion.div>
  );
}
