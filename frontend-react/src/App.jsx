import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Cities from './pages/Cities';
import CityProfile from './pages/CityProfile';
import TravelPlanner from './pages/TravelPlanner';
import Showcase from './pages/Showcase';
import Chatbot from './components/Chatbot';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cities" element={<Cities />} />
        <Route path="/city/:name" element={<CityProfile />} />
        <Route path="/planner" element={<TravelPlanner />} />
        <Route path="/showcase" element={<Showcase />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Header />
        <Chatbot />
        <main className="main-content">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;
