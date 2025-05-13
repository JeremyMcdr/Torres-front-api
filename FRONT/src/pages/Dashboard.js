import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
// import LineChart from '../components/charts/LineChart'; // Pas utilisé sur le dashboard actuel
import { caService, commercialService, motifService, objectifService } from '../services/api';
// Import useFocusChart
import { useFocusChart } from '../context/FocusChartContext';
// Import useAppData
import { useAppData } from '../context/AppDataContext';

// Importer les composants MUI
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Importer les icônes MUI
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; // Pour CA Total
import PeopleIcon from '@mui/icons-material/People'; // Pour Nombre de commerciaux
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Pour Taux de réussite
import AssignmentIcon from '@mui/icons-material/Assignment'; // Pour Motifs

const Dashboard = () => {
  // Use App Data Context
  const { appData } = useAppData();
  const { annees } = appData; // Destructure pre-loaded filter options

  // State for page-specific data and loading/error
  const [loadingData, setLoadingData] = useState(true); // Renamed from loading
  const [dataError, setDataError] = useState(null); // Renamed from loadingError

  // State for selected filter value - Initialize AFTER checking annees
  const [selectedAnnee, setSelectedAnnee] = useState('');

  // États pour les données spécifiques à la page
  const [caTotal, setCATotal] = useState(0);
  const [caParPays, setCAParPays] = useState([]);
  const [tauxReussiteCommerciaux, setTauxReussiteCommerciaux] = useState([]);
  const [motifs, setMotifs] = useState([]);
  const [tauxCompletionObjectifs, setTauxCompletionObjectifs] = useState([]);

  // Focus Chart Context hook
  const { openFocusDialog, isOpen, focusedChartInfo, updateFocusedChartData } = useFocusChart();

  // --- REMOVED: useEffect to fetch available years --- 
  // Data is now pre-loaded via AppDataContext

  // Effect to set the initial selected year once annees are loaded
  useEffect(() => {
    if (annees && annees.length > 0 && !selectedAnnee) {
      setSelectedAnnee(annees[0]); // Default to the most recent year
    }
  }, [annees, selectedAnnee]); // Run when annees load or selectedAnnee changes (to prevent resetting)

  // --- Fetch Data Based on Selected Year (useEffect remains similar) ---
  useEffect(() => {
    // Only fetch if a year is selected
    if (!selectedAnnee) return;

    const fetchData = async () => {
      try {
        setLoadingData(true);
        setDataError(null);

        const filters = { annee: selectedAnnee };

        const [ caTotalData, caParPaysData, tauxReussiteData, motifsData, tauxCompletionData ] = await Promise.all([
          caService.getCATotalByAnnee(selectedAnnee),
          caService.getCAByPaysAnnee(filters),
          commercialService.getTauxReussiteCommercial(filters),
          motifService.getPourcentageMotifsByAnnee(filters),
          objectifService.getTauxCompletionObjectifs(filters)
        ]);

        // Update local state
        setCATotal(caTotalData[0]?.CA_Total || 0);
        setCAParPays(caParPaysData);
        setTauxReussiteCommerciaux(tauxReussiteData);
        setMotifs(motifsData);
        setTauxCompletionObjectifs(tauxCompletionData);

        // Update focused chart data (logic remains the same)
        if (isOpen && focusedChartInfo) {
          console.log("Dashboard: Checking if focused chart needs update. ID:", focusedChartInfo.id);
          switch (focusedChartInfo.id) {
            case 'dashboard-ca-pays':
              updateFocusedChartData('dashboard-ca-pays', caParPaysData);
              break;
            case 'dashboard-taux-reussite':
              updateFocusedChartData('dashboard-taux-reussite', tauxReussiteData);
              break;
            case 'dashboard-motifs-pie':
              updateFocusedChartData('dashboard-motifs-pie', motifsData);
              break;
            case 'dashboard-objectifs':
              updateFocusedChartData('dashboard-objectifs', tauxCompletionData);
              break;
            default:
              break;
          }
        }

      } catch (err) {
        console.error('Erreur lors de la récupération des données du Dashboard:', err);
        setDataError('Erreur lors de la récupération des données. Veuillez réessayer plus tard.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [selectedAnnee, isOpen, focusedChartInfo, updateFocusedChartData]); // Dependencies updated

  // --- Event Handlers (useCallback remains the same) ---
  const handleFilterChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'annee') {
        setSelectedAnnee(value);
    }
  }, []);

  // --- Calculations (useMemo definitions remain the same, but dependencies might implicitly use `annees` from context if needed) ---
  const tauxReussiteMoyen = useMemo(() => {
    if (tauxReussiteCommerciaux.length === 0) return 0;
    const total = tauxReussiteCommerciaux.reduce((acc, curr) => acc + parseFloat(curr.Taux_Reussite || 0), 0);
    return (total / tauxReussiteCommerciaux.length).toFixed(2);
  }, [tauxReussiteCommerciaux]);

  const nombreMotifs = useMemo(() => new Set(motifs.map(m => m.Motif_Commande)).size, [motifs]);

  // Filter Definition for Dialogs (depends on `annees` from context now)
  const anneeFilterDefinition = useMemo(() => ({
      config: [
          { id: 'annee', label: 'Année', options: annees, value: selectedAnnee },
      ],
      onChange: handleFilterChange
  }), [annees, selectedAnnee, handleFilterChange]); // Dependency on `annees` from context

  // --- Render Logic ---
  // Use loadingData and dataError for rendering states
  const showLoading = loadingData;
  const displayError = dataError;

  return (
    <Layout title="Tableau de bord">
      {/* --- Year Filter (uses `annees` from context) --- */}
      <Paper sx={{ padding: 2, marginBottom: 3 }}>
        <Stack direction="row" spacing={2}>
          <FormControl sx={{ minWidth: 150 }} disabled={!annees || annees.length === 0 || loadingData}>
            <InputLabel id="annee-label">Année</InputLabel>
            <Select
              labelId="annee-label"
              id="annee-select"
              value={selectedAnnee} // Controlled by state
              label="Année"
              name="annee"
              onChange={handleFilterChange}
              // Disable if no years loaded or data is loading
            >
              {/* Map over `annees` from context */}
              {annees.map(annee => (
                <MenuItem key={annee} value={annee}>{annee}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* --- Loading / Error Display --- */}
      {displayError && (
        <Alert severity="error" sx={{ marginY: 2 }}>{displayError}</Alert>
      )}
      {showLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <CircularProgress />
        </Box>
      )}

      {/* --- Content: KPIs and Charts (uses loadingData) --- */}
      {!showLoading && !displayError && (
        <>
          {/* KPIs (logic remains the same) */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                title={`CA Total (${selectedAnnee})`}
                value={caTotal.toLocaleString('fr-FR')}
                unit="€"
                icon={<MonetizationOnIcon fontSize="large" />}
                color="#3498db"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                title={`Nb Commerciaux (${selectedAnnee})`}
                value={tauxReussiteCommerciaux.length}
                icon={<PeopleIcon fontSize="large" />}
                color="#2ecc71"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                title={`Taux Réussite Moyen (${selectedAnnee})`}
                value={tauxReussiteMoyen}
                unit="%"
                icon={<TrendingUpIcon fontSize="large" />}
                color="#e74c3c"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                title={`Nombre Motifs (${selectedAnnee})`}
                value={nombreMotifs}
                icon={<AssignmentIcon fontSize="large" />}
                color="#f39c12"
              />
            </Grid>
          </Grid>

          {/* Graphiques (logic remains the same, uses `anneeFilterDefinition` based on context) */}
          <Grid container spacing={3}>
            {/* CA par Pays */}
            <Grid item xs={12} md={6}>
              {(() => {
                  const chartTitle = `CA par Pays (${selectedAnnee})`;
                  const chartProps = { xKey: "Pays", yKey: "CA", title: chartTitle, color: "#3498db" };
                  return (
                      <Box
                          onClick={() => openFocusDialog({
                              id: 'dashboard-ca-pays',
                              type: 'bar',
                              title: chartTitle,
                              chartProps: chartProps,
                              chartData: caParPays,
                              filterDefinition: anneeFilterDefinition // Uses updated definition
                          })}
                          sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                      >
                          <BarChart data={caParPays} {...chartProps} />
                      </Box>
                  );
              })()}
            </Grid>

            {/* Taux Réussite Commerciaux */}
            <Grid item xs={12} md={6}>
             {(() => {
                  const chartTitle = `Taux Réussite Commerciaux (${selectedAnnee})`;
                  const chartProps = { xKey: "Commercial", yKey: "Taux_Reussite", title: chartTitle, color: "#2ecc71", yAxisLabel: "%" };
                  return (
                      <Box
                          onClick={() => openFocusDialog({
                              id: 'dashboard-taux-reussite',
                              type: 'bar',
                              title: chartTitle,
                              chartProps: chartProps,
                              chartData: tauxReussiteCommerciaux,
                              filterDefinition: anneeFilterDefinition // Uses updated definition
                          })}
                           sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                      >
                          <BarChart data={tauxReussiteCommerciaux} {...chartProps} />
                      </Box>
                  );
              })()}
            </Grid>

            {/* Répartition Motifs */}
            <Grid item xs={12} md={6}>
              {(() => {
                  const chartTitle = `Répartition Motifs (${selectedAnnee})`;
                  const chartProps = { nameKey:"Motif_Commande", valueKey:"Pourcentage", title: chartTitle };
                  return (
                      <Box
                          onClick={() => openFocusDialog({
                              id: 'dashboard-motifs-pie',
                              type: 'pie',
                              title: chartTitle,
                              chartProps: chartProps,
                              chartData: motifs,
                              filterDefinition: anneeFilterDefinition // Uses updated definition
                          })}
                           sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                      >
                          <PieChart data={motifs} {...chartProps} />
                      </Box>
                  );
              })()}
            </Grid>

            {/* Taux Complétion Objectifs */}
            <Grid item xs={12} md={6}>
             {(() => {
                  const chartTitle = `Taux Complétion Objectifs (${selectedAnnee})`;
                  const chartProps = { xKey:"Groupe_Vendeur", yKey:"Taux_Completion", title: chartTitle, color:"#e74c3c", yAxisLabel: "%" };
                  return (
                      <Box
                          onClick={() => openFocusDialog({
                              id: 'dashboard-objectifs',
                              type: 'bar',
                              title: chartTitle,
                              chartProps: chartProps,
                              chartData: tauxCompletionObjectifs,
                              filterDefinition: anneeFilterDefinition // Uses updated definition
                          })}
                          sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                      >
                          <BarChart data={tauxCompletionObjectifs} {...chartProps} />
                      </Box>
                  );
              })()}
            </Grid>
          </Grid>
        </>
      )}
    </Layout>
  );
};

export default Dashboard; 