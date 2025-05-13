import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import KpiCard from '../components/KpiCard';
import { motifService } from '../services/api';
import { useFocusChart } from '../context/FocusChartContext';
import { useAppData } from '../context/AppDataContext';

// MUI Components
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

// MUI Icons
import ListAltIcon from '@mui/icons-material/ListAlt'; // Nombre Motifs
import StarIcon from '@mui/icons-material/Star'; // Motif Principal
import PercentIcon from '@mui/icons-material/Percent'; // Pourcentage Motif Principal

const Motifs = () => {
  // Use App Data Context for filter options
  const { appData } = useAppData();
  const { annees, motifs: motifsOptions } = appData; // Rename motifs from context to motifsOptions locally

  // State for page-specific data loading/error
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  // State for selected filter values
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedMotif, setSelectedMotif] = useState(''); // Default to 'Tous'

  // State for page-specific data
  const [pourcentageMotifs, setPourcentageMotifs] = useState([]);

  // Focus Chart Context hook
  const { openFocusDialog, isOpen, focusedChartInfo, updateFocusedChartData } = useFocusChart();

  // Effect to set the initial selected year once annees are loaded
  useEffect(() => {
    if (annees && annees.length > 0 && !selectedAnnee) {
      // Default to the most recent year, or 'all' if none exist (though AppData should handle this)
      setSelectedAnnee(annees[0] || 'all');
    }
  }, [annees, selectedAnnee]);

  // Fetch Data useEffect (depends on selected filters)
  useEffect(() => {
    if (!selectedAnnee) return;

    const fetchData = async () => {
      try {
        setLoadingData(true);
        setDataError(null);

        const filters = {
          annee: selectedAnnee !== 'all' ? selectedAnnee : undefined,
          motif: selectedMotif || undefined,
        };

        const pourcentageData = await motifService.getPourcentageMotifsByAnnee(filters);

        // Update local state
        setPourcentageMotifs(pourcentageData);

        // Update focused chart data (logic remains the same)
        if (isOpen && focusedChartInfo && 
            (focusedChartInfo.id === 'motifs-repartition' || focusedChartInfo.id === 'motifs-pourcentage-bar')) {
            console.log("Motifs: Updating focused chart data", focusedChartInfo.id);
            updateFocusedChartData(focusedChartInfo.id, pourcentageData);
        }

      } catch (err) {
        console.error('Erreur données Motifs:', err);
        setDataError('Erreur récupération données.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [selectedAnnee, selectedMotif, isOpen, focusedChartInfo, updateFocusedChartData]);

  // Filter Change Handler (useCallback remains the same)
  const handleFilterChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'annee') setSelectedAnnee(value);
    if (name === 'motif') setSelectedMotif(value);
  }, []);

  // KPI Calculations useMemo (definitions remain the same)
  const { motifPrincipal, pourcentageMotifPrincipal } = useMemo(() => {
    if (pourcentageMotifs.length === 0) return { motifPrincipal: 'N/A', pourcentageMotifPrincipal: 0 };
    const sortedMotifs = [...pourcentageMotifs].sort((a, b) => parseFloat(b.Pourcentage || 0) - parseFloat(a.Pourcentage || 0));
    const principal = sortedMotifs[0];
    return {
      motifPrincipal: principal?.Motif_Commande || 'N/A',
      pourcentageMotifPrincipal: parseFloat(principal?.Pourcentage || 0).toFixed(2)
    };
  }, [pourcentageMotifs]);
  const nombreMotifsKPI = useMemo(() => new Set(pourcentageMotifs.map(m => m.Motif_Commande)).size, [pourcentageMotifs]); // Renamed to avoid conflict

  // Filter Definition for Dialogs (uses context data)
  const motifsFilterDefinition = useMemo(() => ({
      config: [
          { id: 'annee', label: 'Année', options: annees, value: selectedAnnee },
          // Use motifsOptions (renamed from appData.motifs) for the options here
          { id: 'motif', label: 'Motif', options: motifsOptions, value: selectedMotif }
      ],
      onChange: handleFilterChange
  }), [annees, selectedAnnee, motifsOptions, selectedMotif, handleFilterChange]);

  // --- Render Logic ---
  const showLoading = loadingData;
  const displayError = dataError;

  if (showLoading) {
    return (
      <Layout title="Motifs de commande">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (displayError) {
    return (
      <Layout title="Motifs de commande">
        <Alert severity="error" sx={{ margin: 2 }}>{displayError}</Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Motifs de commande">
      {/* Filtres (uses context data `annees` and `motifsOptions`) */}
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
              {annees.map(annee => (
                <MenuItem key={annee} value={annee}>{annee}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Motif Filter */}
          <FormControl sx={{ minWidth: 200 }} disabled={!motifsOptions || motifsOptions.length === 0 || loadingData}>
            <InputLabel id="motif-label">Motif</InputLabel>
            <Select
              labelId="motif-label"
              id="motif-select"
              value={selectedMotif}
              label="Motif"
              name="motif"
              onChange={handleFilterChange}
            >
              <MenuItem value=""><em>Tous les motifs</em></MenuItem>
              {/* Map over motifsOptions from context */}
              {motifsOptions.map(motif => (
                <MenuItem key={motif} value={motif}>{motif}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* KPIs (use renamed nombreMotifsKPI) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
         <Grid item xs={12} sm={4}>
          <KpiCard
            title="Nombre de Motifs (Filt.)"
            value={nombreMotifsKPI} // Use renamed KPI value
            icon={<ListAltIcon fontSize="large" />}
            color="#3498db"
          />
        </Grid>
         {/* ... other KPI cards ... */}
         <Grid item xs={12} sm={4}>
          <KpiCard
            title="Motif Principal"
            value={motifPrincipal}
            icon={<StarIcon fontSize="large" />}
            color="#2ecc71"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KpiCard
            title="% Motif Principal"
            value={pourcentageMotifPrincipal}
            unit="%"
            icon={<PercentIcon fontSize="large" />}
            color="#e74c3c"
          />
        </Grid>
      </Grid>

      {/* Graphiques (use updated filter definition) */}
      <Grid container spacing={3}>
        {/* Répartition (Pie) */}
        <Grid item xs={12} md={6}>
          {(() => {
            const chartTitle = `Répartition (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee}${selectedMotif ? ` / ${selectedMotif}`: ''})`;
            const chartProps = { nameKey:"Motif_Commande", valueKey:"Pourcentage", title: chartTitle };
            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'motifs-repartition',
                        type: 'pie',
                        title: chartTitle,
                        chartProps: chartProps,
                        chartData: pourcentageMotifs,
                        filterDefinition: motifsFilterDefinition // Use updated definition
                    })}
                    sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                >
                    <PieChart data={pourcentageMotifs} {...chartProps} />
                </Box>
            );
          })()}
        </Grid>

        {/* Pourcentage par Motif (Bar) */}
        <Grid item xs={12} md={6}>
          {(() => {
            const chartTitle = `% par Motif (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee}${selectedMotif ? ` / ${selectedMotif}`: ''})`;
            const chartProps = { xKey: "Motif_Commande", yKey: "Pourcentage", title: chartTitle, color: "#2ecc71", yAxisLabel: "%" };
            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'motifs-pourcentage-bar',
                        type: 'bar',
                        title: chartTitle,
                        chartProps: chartProps,
                        chartData: pourcentageMotifs,
                        filterDefinition: motifsFilterDefinition // Use updated definition
                    })}
                    sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                >
                    <BarChart data={pourcentageMotifs} {...chartProps} />
                </Box>
            );
          })()}
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Motifs; 