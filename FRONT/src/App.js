import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getAppTheme } from './theme'; // Import the theme generating function

import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import ChiffreAffaires from './pages/ChiffreAffaires';
import Commerciaux from './pages/Commerciaux';
import Objectifs from './pages/Objectifs';
import Motifs from './pages/Motifs';

function App() {
  // Detect user's system preference for dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Create the theme based on the mode
  // TODO: Add state and a toggle button later if manual switching is desired
  const theme = React.useMemo(() => getAppTheme(prefersDarkMode ? 'dark' : 'light'), [prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Apply baseline styles and background color from the theme */}
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chiffre-affaires" element={<ChiffreAffaires />} />
          <Route path="/commerciaux" element={<Commerciaux />} />
          <Route path="/objectifs" element={<Objectifs />} />
          <Route path="/motifs" element={<Motifs />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
