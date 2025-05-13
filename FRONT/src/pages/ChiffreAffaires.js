import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import KpiCard from '../components/KpiCard';
import { caService } from '../services/api';
import { useFocusChart } from '../context/FocusChartContext';
import { useAppData } from '../context/AppDataContext';

// Importer les composants MUI
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

// Importer les icônes MUI
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PublicIcon from '@mui/icons-material/Public'; // Pour Nombre de pays
import GroupWorkIcon from '@mui/icons-material/GroupWork'; // Pour Groupes vendeurs

const ChiffreAffaires = () => {
  // Use App Data Context for filter options
  const { appData } = useAppData();
  const { annees, pays } = appData;

  // State for page-specific data loading/error
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  // State for selected filter values - Initialize after checking context data
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedPays, setSelectedPays] = useState(''); // Default to 'Tous'

  // State for page-specific data
  const [caTotal, setCATotal] = useState(0);
  const [caParPays, setCAParPays] = useState([]);
  const [caParVendeur, setCAParVendeur] = useState([]);
  const [caParAnnee, setCAParAnnee] = useState([]);

  const { openFocusDialog, isOpen, focusedChartInfo, updateFocusedChartData } = useFocusChart();

  // Effect to set the initial selected year once annees are loaded
  useEffect(() => {
    if (annees && annees.length > 0 && !selectedAnnee) {
      setSelectedAnnee(annees[0]); // Default to the most recent year
    }
    // We don't need to set selectedPays initially, default empty string means "Tous"
  }, [annees, selectedAnnee]);

  // Filter Change Handler (useCallback remains the same)
  const handleFilterChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'annee') setSelectedAnnee(value);
    if (name === 'pays') setSelectedPays(value);
  }, []);

  // Fetch Data useEffect (depends on selected filters)
  useEffect(() => {
    if (!selectedAnnee) return; // Wait for year to be selected

    const fetchData = async () => {
      try {
        setLoadingData(true);
        setDataError(null);
        const filters = {
            annee: selectedAnnee !== 'all' ? selectedAnnee : undefined,
            pays: selectedPays || undefined
        };

        // Determine the year to fetch total CA for (use current year if 'all' is selected)
        const yearForTotal = selectedAnnee !== 'all' ? selectedAnnee : new Date().getFullYear();
        
        // Fetch all data based on current filters
        const [caTotalData, caParPaysData, caParVendeurData, allYearsDataRes] = await Promise.all([
          caService.getCATotalByAnnee(yearForTotal),
          caService.getCAByPaysAnnee(filters),
          caService.getCAByVendeurAnnee({ annee: filters.annee }), // Only filter by year for vendor CA
          // Fetch CA for each available year for the evolution chart
          Promise.all(annees.filter(year => !isNaN(parseInt(year))).map(year => caService.getCATotalByAnnee(year)))
        ]);

        // Process evolution data
        const validYears = annees.filter(year => !isNaN(parseInt(year)));
        const newCaParAnnee = allYearsDataRes
          .map((res, index) => ({ Annee: validYears[index], CA: res[0]?.CA_Total || 0 }))
          .sort((a, b) => a.Annee - b.Annee);

        // Update local state
        setCATotal(caTotalData[0]?.CA_Total || 0);
        setCAParPays(caParPaysData);
        setCAParVendeur(caParVendeurData);
        setCAParAnnee(newCaParAnnee);

        // Update focused chart data (logic remains the same)
        if (isOpen && focusedChartInfo) {
          console.log("Checking if focused chart needs update. ID:", focusedChartInfo.id);
          if (focusedChartInfo.id === 'ca-par-pays') {
              updateFocusedChartData('ca-par-pays', caParPaysData);
          }
          if (focusedChartInfo.id === 'ca-par-vendeur') {
              updateFocusedChartData('ca-par-vendeur', caParVendeurData);
          }
          if (focusedChartInfo.id === 'ca-evolution') {
              updateFocusedChartData('ca-evolution', newCaParAnnee);
          }
        }

      } catch (err) {
        console.error('Erreur données Chiffre d\'Affaires:', err);
        setDataError('Erreur récupération données.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [selectedAnnee, selectedPays, annees, isOpen, focusedChartInfo, updateFocusedChartData]); // Added annees dependency for evolution chart calculation

  // Filter Definition for CA par Pays chart dialog
  const caPaysFilterDefinition = useMemo(() => ({
    config: [
      { id: 'annee', label: 'Année', options: annees, value: selectedAnnee },
      { id: 'pays', label: 'Pays', options: pays, value: selectedPays }
    ],
    onChange: handleFilterChange
  }), [annees, selectedAnnee, pays, selectedPays, handleFilterChange]);

  // Filter Definition for CA par Vendeur chart dialog (only Annee)
  const caVendeurFilterDefinition = useMemo(() => ({
    config: [
      { id: 'annee', label: 'Année', options: annees, value: selectedAnnee },
    ],
    onChange: handleFilterChange
  }), [annees, selectedAnnee, handleFilterChange]);

  // --- Render Logic ---
  const showLoading = loadingData;
  const displayError = dataError;

  if (showLoading) {
    return (
      <Layout title="Chiffre d'affaires">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (displayError) {
    return (
      <Layout title="Chiffre d'affaires">
        <Alert severity="error" sx={{ margin: 2 }}>{displayError}</Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Chiffre d'affaires">
      {/* Section Filtres (uses `annees` and `pays` from context) */}
      <Paper sx={{ padding: 2, marginBottom: 3 }}>
         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
           {/* Annee Filter */}
           <FormControl sx={{ minWidth: 200 }} disabled={!annees || annees.length === 0 || loadingData}>
             <InputLabel id="annee-label">Année</InputLabel>
             <Select
               labelId="annee-label"
               value={selectedAnnee}
               label="Année"
               name="annee"
               onChange={handleFilterChange}
             >
               {/* <MenuItem value="all"><em>Toutes</em></MenuItem> Consider if 'all' is needed */}
               {annees.map(annee => (
                 <MenuItem key={annee} value={annee}>{annee}</MenuItem>
               ))}
             </Select>
           </FormControl>
           {/* Pays Filter */}
           <FormControl sx={{ minWidth: 200 }} disabled={!pays || pays.length === 0 || loadingData}>
             <InputLabel id="pays-label">Pays</InputLabel>
             <Select
               labelId="pays-label"
               value={selectedPays}
               label="Pays"
               name="pays"
               onChange={handleFilterChange}
             >
               <MenuItem value=""><em>Tous</em></MenuItem>
               {pays.map(p => (
                 <MenuItem key={p} value={p}>{p}</MenuItem>
               ))}
             </Select>
           </FormControl>
         </Stack>
      </Paper>

      {/* KPIs (logic remains the same) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
         <Grid item xs={12} sm={4}>
          <KpiCard
            title={`CA Total (${selectedAnnee === 'all' ? new Date().getFullYear() : selectedAnnee})`}
            value={caTotal.toLocaleString('fr-FR')}
            unit="€"
            icon={<MonetizationOnIcon fontSize="large" />}
            color="#3498db"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KpiCard
            title="Nombre de pays (Filtrés)"
            value={caParPays.length}
            icon={<PublicIcon fontSize="large" />}
            color="#2ecc71"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KpiCard
            title="Nombre de groupes vendeurs"
            value={caParVendeur.length}
            icon={<GroupWorkIcon fontSize="large" />}
            color="#e74c3c"
          />
        </Grid>
      </Grid>

      {/* Graphiques (use updated filter definitions) */}
      <Grid container spacing={3}>
        {/* CA par Pays */}
        <Grid item xs={12} md={6}>
          {(() => { 
            const chartTitle = `CA par pays (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee}${selectedPays ? ` / ${selectedPays}` : ''})`;
            const chartProps = { xKey: "Pays", yKey: "CA", title: chartTitle, color: "#3498db" }; 
            return (
              <Box 
                  onClick={() => openFocusDialog({
                    id: 'ca-par-pays', 
                    type: 'bar', 
                    title: chartTitle, 
                    chartProps, 
                    chartData: caParPays, 
                    filterDefinition: caPaysFilterDefinition // Use specific definition
                  })} 
                  sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
              >
                  <BarChart data={caParPays} {...chartProps} />
              </Box>
            );
          })()}
        </Grid>

        {/* CA par Vendeur */}
        <Grid item xs={12} md={6}>
          {(() => { 
            const chartTitle = `CA par groupe de vendeurs (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee})`;
            const chartProps = { xKey: "Groupe_Vendeur", yKey: "CA", title: chartTitle, color: "#2ecc71" };
            return (
                <Box 
                  onClick={() => openFocusDialog({
                    id: 'ca-par-vendeur',
                    type: 'bar', 
                    title: chartTitle, 
                    chartProps, 
                    chartData: caParVendeur, 
                    filterDefinition: caVendeurFilterDefinition // Use specific definition
                  })} 
                  sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                >
                    <BarChart data={caParVendeur} {...chartProps} />
                </Box>
            );
          })()}
        </Grid>

        {/* Evolution CA */}
        <Grid item xs={12}>
          {(() => {
            const chartTitle = "Évolution du CA par année";
            const chartProps = { xKey: "Annee", yKey: "CA", title: chartTitle, color: "#e74c3c" };
            return (
                <Box 
                  onClick={() => openFocusDialog({
                    id: 'ca-evolution',
                    type: 'line', 
                    title: chartTitle, 
                    chartProps, 
                    chartData: caParAnnee,
                    filterDefinition: null // No filters for this one in dialog
                  })} 
                  sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                >
                    <LineChart data={caParAnnee} {...chartProps} />
                </Box>
            );
          })()}
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ChiffreAffaires; 