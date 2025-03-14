import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import ChiffreAffaires from './pages/ChiffreAffaires';
import Commerciaux from './pages/Commerciaux';
import Objectifs from './pages/Objectifs';
import Motifs from './pages/Motifs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chiffre-affaires" element={<ChiffreAffaires />} />
        <Route path="/commerciaux" element={<Commerciaux />} />
        <Route path="/objectifs" element={<Objectifs />} />
        <Route path="/motifs" element={<Motifs />} />
      </Routes>
    </Router>
  );
}

export default App;
