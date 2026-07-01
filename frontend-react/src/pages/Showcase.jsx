import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Server, Monitor, Activity, ArrowRight, CloudRain,
  Terminal, Globe, Cpu, ChevronRight, LayoutDashboard, Search, Hourglass, Link
} from 'lucide-react';

export default function Showcase() {
  const [activeCodeTab, setActiveCodeTab] = useState(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const codeSnippets = [
    {
      title: "1. KAFKA PRODUCER",
      desc: "Configuring the Kafka Producer to handle real-time metric payloads from global endpoints.",
      label: "PRODUCER",
      code: `from confluent_kafka import Producer
import json
from datetime import datetime

# Producer Configuration
conf = {
    'bootstrap.servers': 'localhost:9092',
    'client.id': 'weather-producer'
}

producer = Producer(conf)

def fetch_and_produce():
    # Fetch data and send to Kafka
    payload = {
        "city": "Cairo",
        "timestamp": str(datetime.now()),
        "weather": {...},
    }
    
    producer.produce(
        'raw-weather-data', 
        key=b'Cairo',
        value=json.dumps(payload).encode('utf-8')
    )
    producer.flush()`
    },
    {
      title: "2. DATA TRANSFORMATION",
      desc: "Processing raw weather arrays into a structured Pandas DataFrame for analytics.",
      label: "PROCESSING",
      code: `import pandas as pd

def process_weather_data(weather_data):
    rows = []
    for city_data in weather_data:
        city = city_data['city']
        weather_hourly = city_data['weather']['hourly']
        
        # Combine extracted data into rows
        for time, temp, hum in zip(
            weather_hourly['time'], 
            weather_hourly['temperature_2m'],
            weather_hourly['relative_humidity_2m']
        ):
            rows.append({
                'city': city,
                'time': time,
                'temperature_°C': temp,
                'humidity_%': hum
            })
            
    return pd.DataFrame(rows)`
    },
    {
      title: "3. REAL-TIME STREAMING",
      desc: "Consuming processed Kafka streams and broadcasting them to React via Server-Sent Events (SSE).",
      label: "SSE API",
      code: `from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio
import json

app = FastAPI()
latest_metrics_cache = {}

async def event_generator():
    last_sent = {}
    while True:
        updates = []
        for city, data in latest_metrics_cache.items():
            if last_sent.get(city) != data.get('timestamp'):
                updates.append(data)
                last_sent[city] = data.get('timestamp')
        
        if updates:
            yield f"data: {json.dumps(updates)}\\n\\n"
            
        await asyncio.sleep(1)

@app.get("/api/stream/metrics")
async def stream_metrics():
    return StreamingResponse(
        event_generator(), 
        media_type="text/event-stream"
    )`
    }
  ];

  return (
    <div style={{
      color: 'var(--text-primary)',
      minHeight: '100vh',
      margin: '0',
      padding: '2rem',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '8rem', paddingTop: '4rem' }}
        >
          <div className="glass-panel" style={{ display: 'inline-block', padding: '0.4rem 1.2rem', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2rem' }}>
            DEPI Graduation Project Round 4 2024
          </div>
          
          <h1 style={{ fontSize: '5.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '0', textShadow: '0 0 40px rgba(212,175,55,0.3)' }}>
            Meteorological Data
          </h1>
          <h2 style={{ fontSize: '5.5rem', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Real-Time Analytics
          </h2>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
            A comprehensive enterprise analytics solution transforming raw operational data 
            into strategic business intelligence. Uncovering hidden operational insights and 
            predictive trends.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <button style={{ padding: '0.875rem 2rem', backgroundColor: 'var(--accent)', color: '#000', border: 'none', borderRadius: '9999px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s', boxShadow: '0 0 20px rgba(212,175,55,0.4)' }}>
              Download Report <ArrowRight size={18} />
            </button>
            <button className="glass-panel" style={{ padding: '0.875rem 2rem', color: 'var(--text-primary)', borderRadius: '9999px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--glass-border)' }}>
              GitHub Repository
            </button>
          </div>
        </motion.div>

        {/* Real Problems Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          style={{ marginBottom: '10rem', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'start' }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              ⚙️ THE BUSINESS CONTEXT
            </div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
              Real Problems
            </h2>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Data-Driven Solutions
            </h2>
            
            <div style={{ fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--text-secondary)', borderLeft: '4px solid var(--accent)', paddingLeft: '1.5rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              "Every business faces friction, but within every problem lies a path to action. 
              My role was to step into the <span style={{color: 'var(--text-primary)'}}>Data Pipeline</span> chaos and find the numbers that could fix it."
            </div>

            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '3rem' }}>
              By leveraging the specialized capabilities of <span style={{color: 'var(--text-primary)'}}>Kafka</span> for streaming, <span style={{color: 'var(--text-primary)'}}>FastAPI</span> for logic, 
              and <span style={{color: 'var(--text-primary)'}}>React</span> for visualization, we provided a complete end-to-end solution—transforming 
              deep business headaches into clear, measurable growth opportunities.
            </p>

            <div className="glass-panel" style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderRadius: '16px' }}>
              <div style={{ background: 'var(--accent)', padding: '0.5rem', borderRadius: '8px' }}>
                <Activity color="#000" size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em', color: 'var(--accent)' }}>OUR MISSION</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Solve technical gaps to drive business results.</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Card 1 */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={18} color="var(--accent)" />
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid var(--glass-border)', padding: '0.3rem 0.6rem', borderRadius: '99px', color: 'var(--text-secondary)' }}>KAFKA + PYTHON</div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Delayed Insights</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EF4444', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>THE PROBLEM</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Losing money in certain regions with no visibility on the 'why' or 'where'.</p>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>THE SOLUTION</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>Identified high-cost zones through data streaming and Python spatial analysis.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Server size={18} color="var(--accent)" />
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid var(--glass-border)', padding: '0.3rem 0.6rem', borderRadius: '99px', color: 'var(--text-secondary)' }}>FASTAPI</div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Information Chaos</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EF4444', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>THE PROBLEM</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Data fragmented across thousands of manual rows, making it unreadable.</p>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>THE SOLUTION</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>Consolidated chaotic datasets into a centralized, clean data stream.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Monitor size={18} color="var(--accent)" />
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid var(--glass-border)', padding: '0.3rem 0.6rem', borderRadius: '99px', color: 'var(--text-secondary)' }}>REACT UI</div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Decision Delays</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EF4444', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>THE PROBLEM</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Updates arriving late with no system to track or mitigate bottlenecks.</p>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>THE SOLUTION</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>Built a real-time tracking dashboard to monitor and display streaming metrics.</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cpu size={18} color="var(--accent)" />
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid var(--glass-border)', padding: '0.3rem 0.6rem', borderRadius: '99px', color: 'var(--text-secondary)' }}>PYTHON</div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Market Blindness</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EF4444', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>THE PROBLEM</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Inability to predict demand, leading to frequent operational issues.</p>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>THE SOLUTION</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>Implemented Python predictive models to forecast operations and optimize performance.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Project Architecture Horizontal Flow */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          style={{ marginBottom: '10rem', textAlign: 'center' }}
        >
          <h2 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>Project Architecture</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 4rem auto', lineHeight: 1.6 }}>
            A comprehensive data pipeline transforming raw operational data into multi-layered intelligence using enterprise-grade tools.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {[
              { icon: <CloudRain size={24} />, title: "RAW DATA", desc: "API Dataset" },
              { icon: <Database size={24} />, title: "INGESTION", desc: "Kafka Queue" },
              { icon: <Server size={24} />, title: "PROCESSING", desc: "Data Model" },
              { icon: <Activity size={24} />, title: "STREAMING", desc: "SSE Pipeline" },
              { icon: <Monitor size={24} />, title: "REACT UI", desc: "Live Dashboard" }
            ].map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="glass-panel" style={{ minWidth: '160px', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ background: 'rgba(212,175,55,0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', color: 'var(--accent)' }}>
                    {step.icon}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{step.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{step.desc}</div>
                </div>
                {idx < 4 && (
                  <div style={{ color: 'var(--accent)', opacity: 0.5 }}>
                    <ChevronRight size={24} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.section>

        {/* Code Showcase Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          style={{ marginBottom: '10rem' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '1rem' }}>DATA ARCHITECTURE</div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Code Showcase</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '3rem', fontSize: '1.1rem' }}>
                Explore specialized Python procedures developed for the continuous data streaming layer.
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                {codeSnippets.map((tab, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveCodeTab(idx)}
                    className="glass-panel" 
                    style={{ 
                      padding: '0.5rem 1rem', 
                      color: activeCodeTab === idx ? 'var(--bg-primary)' : 'var(--text-secondary)', 
                      background: activeCodeTab === idx ? 'var(--accent)' : 'transparent',
                      borderRadius: '9999px', 
                      fontSize: '0.8rem', 
                      fontWeight: 700, 
                      letterSpacing: '0.05em', 
                      border: activeCodeTab === idx ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeCodeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  style={{ marginBottom: '2rem' }}
                >
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{codeSnippets[activeCodeTab].title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{codeSnippets[activeCodeTab].desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mac Terminal Window Mockup */}
            <div className="glass-panel" style={{ background: '#0a0a0a', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
              <div style={{ background: '#111', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }}></div>
                <div style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em', background: 'rgba(212,175,55,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  ACTIVE PIPELINE
                </div>
              </div>
              <div style={{ padding: '2rem', color: '#E2E8F0', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.6, overflowX: 'auto', minHeight: '350px' }}>
                <div style={{ color: '#64748B', marginBottom: '1rem' }}>
                  {`"""`} <br/>
                  {codeSnippets[activeCodeTab].title} <br/>
                  {`"""`}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCodeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--accent)' }}>
                      {codeSnippets[activeCodeTab].code}
                    </pre>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.section>

        {/* The Intelligence Layer Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          style={{ marginBottom: '10rem', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'center' }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              THE INTELLIGENCE LAYER
            </div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              Answering<br/>Business<br/>Questions
            </h2>
            
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Developing high-impact visual narratives using <span style={{color: 'var(--text-primary)'}}>React</span>. We transform multi-dimensional datasets into interactive executive summaries that provide immediate answers to critical business problems.
            </p>

            <button style={{ padding: '0.875rem 2rem', backgroundColor: 'var(--accent)', color: '#000', border: 'none', borderRadius: '9999px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s', boxShadow: '0 0 20px rgba(212,175,55,0.4)' }}>
              Launch Live Report <ArrowRight size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Intel Card 1 */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <LayoutDashboard size={24} color="var(--accent)" />
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid var(--glass-border)', padding: '0.3rem 0.6rem', borderRadius: '99px', color: 'var(--text-secondary)' }}>ADVANCED VISUALS</div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'var(--accent)' }}>QUESTION</div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4 }}>Where exactly are our thermal bottlenecks?</p>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>RESOLUTION</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Engineered complex visual mapping to calculate regional heat distributions and rank severity.</p>
              </div>
            </div>

            {/* Intel Card 2 */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Search size={24} color="var(--accent)" />
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid var(--glass-border)', padding: '0.3rem 0.6rem', borderRadius: '99px', color: 'var(--text-secondary)' }}>DRILL-THROUGH</div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'var(--accent)' }}>QUESTION</div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4 }}>Which specific regions are causing data anomalies?</p>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>RESOLUTION</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Implemented drill-through pages that allow executives to dive from high-level KPIs to granular details.</p>
              </div>
            </div>

            {/* Intel Card 3 */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Hourglass size={24} color="var(--accent)" />
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid var(--glass-border)', padding: '0.3rem 0.6rem', borderRadius: '99px', color: 'var(--text-secondary)' }}>TIME INTELLIGENCE</div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'var(--accent)' }}>QUESTION</div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4 }}>How do seasonal trends impact our systems?</p>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>RESOLUTION</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Built custom time-series logic to analyze complex seasonal demand patterns and alert on anomalies.</p>
              </div>
            </div>

            {/* Intel Card 4 */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Link size={24} color="var(--accent)" />
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid var(--glass-border)', padding: '0.3rem 0.6rem', borderRadius: '99px', color: 'var(--text-secondary)' }}>DATA MODELING</div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'var(--accent)' }}>QUESTION</div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4 }}>How can we achieve lightning-fast performance?</p>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>RESOLUTION</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Optimized the data model relationships and stream payload to ensure instant interactivity.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Why Data Modeling Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          style={{ marginBottom: '10rem', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem' }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              WHY DATA MODELING?
            </div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              Building a<br/>Star Schema
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Raw data is often messy and slow. We transformed it into a <span style={{color: 'var(--text-primary)'}}>Star Schema</span>—the gold standard for analytics.
            </p>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
              <div style={{ fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)' }}>WHY IT MATTERS:</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--accent)' }}>→</span> It organizes data so the dashboard loads instantly.
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--accent)' }}>→</span> It connects different areas (Metrics, Locations, Customers) seamlessly.
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent)' }}>→</span> It ensures that a single change is updated everywhere automatically.
                </li>
              </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.2rem' }}>1 Fact Table</h4>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>THE CORE</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Centralized storage for all operational transactions.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.2rem' }}>5 Dimensions</h4>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>CONTEXT</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Detailed tables for Products, Customers, Dates, and Locations.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.2rem' }}>1:Many Logic</h4>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>EFFICIENCY</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Optimized relationships that make queries 10x faster.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.2rem' }}>Clean Data</h4>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>GOAL</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Eliminating redundancy to ensure 100% accurate reporting.</p>
              </div>
            </div>
          </div>

          {/* Right side Diagram Mockup */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', width: '100%', height: '400px', padding: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--accent)', color: '#000', padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>BLUEPRINT</div>
              
              {/* Abstract schema diagram */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ width: '100px', height: '80px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}></div>
                  <div style={{ width: '100px', height: '80px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}></div>
                </div>
                <div style={{ width: '140px', height: '200px', border: '2px solid var(--accent)', borderRadius: '8px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(212,175,55,0.2)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>FACT TABLE</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ width: '100px', height: '80px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}></div>
                  <div style={{ width: '100px', height: '80px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}></div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              * Visualizing the optimized relationships between core tables.
            </div>
          </div>
        </motion.section>

        {/* The Project Team Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          style={{ marginBottom: '10rem', textAlign: 'center' }}
        >
          <h2 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>The Project Team</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 4rem auto', lineHeight: 1.6 }}>
            Collaboratively delivered through the Digital Egypt Pioneers Initiative (DEPI).<br/>
            Under the supervision of <strong style={{color: 'var(--text-primary)'}}>Eng. Mohamed Roshdy</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
            {[
              { letter: 'M', name: 'Mohamed Sayed' },
              { letter: 'K', name: 'Kareman Hamdy' },
              { letter: 'Y', name: 'Yusuf Ahmed' },
              { letter: 'A', name: 'Ahmed Ibrahim' }
            ].map((member, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '3rem 2rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 1.5rem auto', color: 'var(--accent)' }}>
                  {member.letter}
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{member.name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Data Engineer</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <a href="#" style={{ textDecoration: 'none', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, border: '1px solid var(--glass-border)', transition: 'all 0.2s' }}>in</a>
                  <a href="#" style={{ textDecoration: 'none', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, border: '1px solid var(--glass-border)', transition: 'all 0.2s' }}>gh</a>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Core Technologies Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          style={{ marginBottom: '6rem', textAlign: 'center' }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '3rem' }}>Core Technologies</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            {['Python', 'FastAPI', 'Apache Kafka', 'React', 'Pandas', 'Zookeeper', 'Docker', 'Tailwind CSS'].map((tech, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '0.75rem 2rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {tech}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div>© 2024 DEPI Weather Data Pipeline.</div>
          <div style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => window.scrollTo(0,0)}>Back to top ↑</div>
        </div>

      </div>
    </div>
  );
}
