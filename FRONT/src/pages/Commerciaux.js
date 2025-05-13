import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/charts/BarChart';
import KpiCard from '../components/KpiCard';
import { commercialService } from '../services/api';
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
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'; // Nombre Commerciaux
import PercentIcon from '@mui/icons-material/Percent'; // Taux réussite
import HourglassTopIcon from '@mui/icons-material/HourglassTop'; // Temps conversion
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Nombre conversions

const Commerciaux = () => {
  // Use App Data Context for filter options
  const { appData } = useAppData();
  // Note: `commerciaux` in context has {id, nom} structure
  const { annees, commerciaux } = appData;

  // State for page-specific data loading/error
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  // State for selected filter values
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedCommercial, setSelectedCommercial] = useState(''); // Default to 'Tous'

  // State for page-specific data
  const [pourcentageCommandes, setPourcentageCommandes] = useState([]);
  const [tauxReussite, setTauxReussite] = useState([]);
  const [tempsConversion, setTempsConversion] = useState([]); // Contains Nombre_Conversions too

  // Focus Chart Context hook
  const { openFocusDialog, isOpen, focusedChartInfo, updateFocusedChartData } = useFocusChart();

  // Effect to set the initial selected year once annees are loaded
  useEffect(() => {
    if (annees && annees.length > 0 && !selectedAnnee) {
      setSelectedAnnee(annees[0] || 'all'); // Default to most recent or 'all'
    }
  }, [annees, selectedAnnee]);

  // Fetch Data useEffect (depends on selected filters)
  useEffect(() => {
    if (!selectedAnnee) return; // Wait for year selection

    const fetchData = async () => {
      try {
        setLoadingData(true);
        setDataError(null);

        const filters = {
          annee: selectedAnnee !== 'all' ? selectedAnnee : undefined,
          commercial: selectedCommercial || undefined,
        };

        const [pourcentageData, tauxReussiteData, tempsConversionData] = await Promise.all([
          commercialService.getPourcentageCommandesCommercial(filters),
          commercialService.getTauxReussiteCommercial(filters),
          commercialService.getTempsConversion(filters),
        ]);

        // Update local state
        setPourcentageCommandes(pourcentageData);
        setTauxReussite(tauxReussiteData);
        setTempsConversion(tempsConversionData);

        // Update focused chart data (logic remains the same, uses fetched data)
        if (isOpen && focusedChartInfo) {
             // ... existing update logic ...
              console.log("Commerciaux: Checking if focused chart needs update. ID:", focusedChartInfo.id);
            switch (focusedChartInfo.id) {
                case 'commerciaux-pct-commandes':
                    updateFocusedChartData('commerciaux-pct-commandes', pourcentageData);
                    break;
                case 'commerciaux-taux-reussite':
                    updateFocusedChartData('commerciaux-taux-reussite', tauxReussiteData);
                    break;
                case 'commerciaux-temps-conversion':
                    updateFocusedChartData('commerciaux-temps-conversion', tempsConversionData);
                    break;
                case 'commerciaux-nb-conversions':
                    updateFocusedChartData('commerciaux-nb-conversions', tempsConversionData);
                    break;
                default:
                    break;
            }
        }

      } catch (err) {
        console.error('Erreur données Commerciaux:', err);
        setDataError(`Erreur lors de la récupération des données Commerciaux: ${err.message || 'Veuillez réessayer plus tard.'}`);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [selectedAnnee, selectedCommercial, isOpen, focusedChartInfo, updateFocusedChartData]);

  // Filter Change Handler (useCallback remains the same)
  const handleFilterChange = useCallback((event) => {
    // ... existing handler logic ...
    const { name, value } = event.target;
    if (name === 'annee') setSelectedAnnee(value);
    if (name === 'commercial') setSelectedCommercial(value);
  }, []);

  // KPI Calculations useMemo (definitions remain the same)
  const tauxReussiteMoyen = useMemo(() => tauxReussite.length === 0 ? 0 : (tauxReussite.reduce((acc, curr) => acc + parseFloat(curr.Taux_Reussite || 0), 0) / tauxReussite.length).toFixed(2), [tauxReussite]);
  const tempsConversionMoyen = useMemo(() => tempsConversion.length === 0 ? 0 : (tempsConversion.reduce((acc, curr) => acc + parseFloat(curr.Temps_Moyen_Conversion || 0), 0) / tempsConversion.length).toFixed(1), [tempsConversion]);
  const nombreConversionsTotal = useMemo(() => tempsConversion.reduce((acc, curr) => acc + parseInt(curr.Nombre_Conversions || 0), 0), [tempsConversion]);
  const nombreCommerciauxFiltres = useMemo(() => new Set(pourcentageCommandes.map(c => c.Commercial)).size, [pourcentageCommandes]);

  // Filter Definition for Dialogs (uses context data `annees` and `commerciaux`)
  const commerciauxFilterDefinition = useMemo(() => ({
      config: [
          { id: 'annee', label: 'Année', options: annees, value: selectedAnnee },
          // Use the {id, nom} structure from context
          { id: 'commercial', label: 'Commercial', options: commerciaux, value: selectedCommercial }
      ],
      onChange: handleFilterChange
      // Map options directly if context provides {value, label} structure later
      // options: commerciaux.map(c => ({ value: c.id, label: c.nom }))
  }), [annees, selectedAnnee, commerciaux, selectedCommercial, handleFilterChange]);

  // --- Render Logic ---
  const showLoading = loadingData;
  const displayError = dataError;

  if (showLoading) {
     // ... loading JSX ...
       return (
      <Layout title="Commerciaux">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (displayError) {
    // ... error JSX ...
      return (
      <Layout title="Commerciaux">
        <Alert severity="error" sx={{ margin: 2 }}>{displayError}</Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Commerciaux">
      {/* Filtres (uses context data `annees` and `commerciaux`) */}
      <Paper sx={{ padding: 2, marginBottom: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Annee Filter */}
          <FormControl sx={{ minWidth: 200 }} disabled={!annees || annees.length === 0 || loadingData}>
            <InputLabel id="annee-label">Année</InputLabel>
            <Select
              labelId="annee-label"
              id="annee-select"
              value={selectedAnnee}
              label="Année"
              name="annee"
              onChange={handleFilterChange}
            >
              <MenuItem value="all"><em>Toutes les années</em></MenuItem>
              {/* Map over `annees` from context */}
              {annees.map(annee => (
                <MenuItem key={annee} value={annee}>{annee}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Commercial Filter */}
          <FormControl sx={{ minWidth: 200 }} disabled={!commerciaux || commerciaux.length === 0 || loadingData}>
            <InputLabel id="commercial-label">Commercial</InputLabel>
            <Select
              labelId="commercial-label"
              id="commercial-select"
              value={selectedCommercial}
              label="Commercial"
              name="commercial"
              onChange={handleFilterChange}
            >
              <MenuItem value=""><em>Tous les commerciaux</em></MenuItem>
              {/* Map over `commerciaux` from context */}
              {commerciaux.map(c => (
                // Use id and nom from the context data structure
                <MenuItem key={c.id} value={c.id}>{c.nom}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* KPIs (logic remains the same) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Nombre Commerciaux (Filt.)"
            value={nombreCommerciauxFiltres}
            icon={<PeopleAltIcon fontSize="large" />}
            color="#3498db"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Taux Réussite Moyen"
            value={tauxReussiteMoyen}
            unit="%"
            icon={<PercentIcon fontSize="large" />}
            color="#2ecc71"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Temps Conv. Moyen"
            value={tempsConversionMoyen}
            unit="jours"
            icon={<HourglassTopIcon fontSize="large" />}
            color="#9b59b6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Nombre Conv. Total"
            value={nombreConversionsTotal}
            icon={<CheckCircleOutlineIcon fontSize="large" />}
            color="#f39c12"
          />
        </Grid>
      </Grid>

      {/* Graphiques (use updated filter definition) */}
      <Grid container spacing={3}>
        {/* % Commandes */}
        <Grid item xs={12} md={6}>
          {(() => {
            const chartTitle = `% Commandes (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee}${selectedCommercial ? ` / ${commerciaux.find(c => c.id === selectedCommercial)?.nom || selectedCommercial}` : ''})`;
            const chartProps = { xKey:"Nom_Commercial", yKey:"Pourcentage_Commandes", title: chartTitle, color:"#3498db", yAxisLabel:"%" };
            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'commerciaux-pct-commandes',
                        type: 'bar',
                        title: chartTitle,
                        chartProps: chartProps,
                        chartData: pourcentageCommandes,
                        filterDefinition: commerciauxFilterDefinition // Use updated definition
                    })}
                    sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                >
                    <BarChart data={pourcentageCommandes} {...chartProps} />
                </Box>
            );
          })()}
        </Grid>

        {/* Taux Réussite */}
        <Grid item xs={12} md={6}>
           {(() => {
            const chartTitle = `Taux Réussite (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee}${selectedCommercial ? ` / ${commerciaux.find(c => c.id === selectedCommercial)?.nom || selectedCommercial}` : ''})`;
            const chartProps = { xKey:"Nom_Commercial", yKey:"Taux_Reussite", title: chartTitle, color:"#2ecc71", yAxisLabel:"%" };
            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'commerciaux-taux-reussite',
                        type: 'bar',
                        title: chartTitle,
                        chartProps: chartProps,
                        chartData: tauxReussite,
                        filterDefinition: commerciauxFilterDefinition // Use updated definition
                    })}
                    sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                >
                    <BarChart data={tauxReussite} {...chartProps} />
                </Box>
            );
          })()}
        </Grid>

        {/* Temps Conv. Moyen */}
        <Grid item xs={12} md={6}>
          {(() => {
            const chartTitle = `Temps Conv. Moyen (jours) (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee}${selectedCommercial ? ` / ${commerciaux.find(c => c.id === selectedCommercial)?.nom || selectedCommercial}` : ''})`;
            const chartProps = { xKey:"Nom_Commercial", yKey:"Temps_Moyen_Conversion", title: chartTitle, color:"#9b59b6", yAxisLabel:"Jours" };
            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'commerciaux-temps-conversion',
                        type: 'bar',
                        title: chartTitle,
                        chartProps: chartProps,
                        chartData: tempsConversion,
                        filterDefinition: commerciauxFilterDefinition // Use updated definition
                    })}
                    sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                >
                    <BarChart data={tempsConversion} {...chartProps} />
                </Box>
            );
          })()}
        </Grid>

         {/* Nombre Conversions */}
        <Grid item xs={12} md={6}>
          {(() => {
            const chartTitle = `Nombre Conversions (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee}${selectedCommercial ? ` / ${commerciaux.find(c => c.id === selectedCommercial)?.nom || selectedCommercial}` : ''})`;
            const chartProps = { xKey:"Nom_Commercial", yKey:"Nombre_Conversions", title: chartTitle, color:"#f39c12" };
            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'commerciaux-nb-conversions',
                        type: 'bar',
                        title: chartTitle,
                        chartProps: chartProps,
                        chartData: tempsConversion,
                        filterDefinition: commerciauxFilterDefinition // Use updated definition
                    })}
                    sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                 >
                    <BarChart data={tempsConversion} {...chartProps} />
                 </Box>
            );
          })()}
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Commerciaux; 