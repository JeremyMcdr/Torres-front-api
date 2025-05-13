import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getAppTheme } from './theme'; // Import the theme generating function
import { FocusChartProvider } from './context/FocusChartContext'; // Import the provider
import ChartFocusDialog from './components/dialogs/ChartFocusDialog'; // Import the dialog

// Import App loading context and screen
import { useAppData } from './context/AppDataContext';
import AppLoadingScreen from './components/AppLoadingScreen';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import ChiffreAffaires from './pages/ChiffreAffaires';
import Commerciaux from './pages/Commerciaux';
import Objectifs from './pages/Objectifs';
import Motifs from './pages/Motifs';

function App() {
  // --- Hooks called at the top level ---
  const { loading, error } = useAppData();
  // Determine theme mode *before* conditional returns
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(() => getAppTheme(prefersDarkMode ? 'dark' : 'light'), [prefersDarkMode]);

  // --- Conditional returns for loading/error states ---
  if (loading) {
    return <AppLoadingScreen />;
  }

  if (error) {
    // Render error within the theme provider for consistent styling
    return (
      <ThemeProvider theme={theme}>
         <CssBaseline />
         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
           <Alert severity="error" sx={{ width: '100%', maxWidth: '600px' }}>
             <strong>Erreur de chargement :</strong> {error}
           </Alert>
         </Box>
      </ThemeProvider>
    );
  }

  // --- Main application render (if no loading or error) ---
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* FocusChartProvider should wrap the Routes and Dialog */}
      <FocusChartProvider>
        <Routes>
          {/* Default route redirects to Dashboard */}
          <Route path="/" element={<Navigate replace to="/dashboard" />} />
          {/* Define routes for each page */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chiffre-affaires" element={<ChiffreAffaires />} />
          <Route path="/commerciaux" element={<Commerciaux />} />
          <Route path="/motifs" element={<Motifs />} />
          <Route path="/objectifs" element={<Objectifs />} />
          {/* Other routes or 404 redirect if needed */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
        {/* The focus dialog is rendered here to be global within the context */}
        <ChartFocusDialog />
      </FocusChartProvider>
    </ThemeProvider>
  );
}

export default App;
