import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import GaugeChart from '../components/charts/GaugeChart';
import ComparisonChart from '../components/charts/ComparisonChart';
import KpiCard from '../components/KpiCard';
import { objectifService, commercialService } from '../services/api';
import { useFocusChart } from '../context/FocusChartContext';
import { useAppData } from '../context/AppDataContext';
// import './Objectifs.css'; // Remove CSS import

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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

// MUI Icons
import TrackChangesIcon from '@mui/icons-material/TrackChanges'; // Objectif Total
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; // CA Total
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Taux Completion
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction'; // Projection

const Objectifs = () => {
  // Use App Data Context for filter options
  const { appData } = useAppData();
  const { annees, groupesVendeurs } = appData;

  // State for page-specific data loading/error
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  // State for selected filter values
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedGroupeVendeur, setSelectedGroupeVendeur] = useState(''); // Default to 'Tous'

  // State for page-specific data
  const [objectifs, setObjectifs] = useState([]);
  const [tauxCompletion, setTauxCompletion] = useState([]);
  const [projectionCA, setProjectionCA] = useState(null);
  const [evolutionData, setEvolutionData] = useState([]);

  // Focus Chart Context hook
  const { openFocusDialog, isOpen, focusedChartInfo, updateFocusedChartData } = useFocusChart();

  // Effect to set the initial selected year once annees are loaded
  useEffect(() => {
    if (annees && annees.length > 0 && !selectedAnnee) {
       setSelectedAnnee(annees[0] || new Date().getFullYear().toString()); // Fallback to current year string if no years
    }
  }, [annees, selectedAnnee]);

  // Fetch Data useEffect (depends on selected filters)
  useEffect(() => {
    if (!selectedAnnee) return; // Wait for year to be selected

    const fetchData = async () => {
      try {
        setLoadingData(true);
        setDataError(null);

        const currentYear = new Date().getFullYear();
        const anneeFilterValue = selectedAnnee !== 'all' ? selectedAnnee : undefined;
        const groupeFilterValue = selectedGroupeVendeur || undefined;

        const filters = {
          annee: anneeFilterValue,
          groupe_vendeur: groupeFilterValue,
        };

        console.log("[Objectifs Page] Fetching data with filters:", filters);

        const [objectifsData, tauxCompletionData, evolutionDataRes] = await Promise.all([
          objectifService.getObjectifsCommerciaux(filters),
          objectifService.getTauxCompletionObjectifs(filters),
          objectifService.getEvolutionObjectifsCA(groupeFilterValue) // Evolution depends only on group
        ]);

        // --- DEBUGGING: Log raw API data ---
        console.log("[Objectifs Page] Raw objectifsData:", objectifsData);
        console.log("[Objectifs Page] Raw evolutionDataRes:", evolutionDataRes);
        // -------------------------------------

        // Update local state
        setObjectifs(objectifsData);
        setTauxCompletion(tauxCompletionData);
        setEvolutionData(evolutionDataRes);

        // Fetch projection logic (remains the same)
        let newProjectionCA = null;
        if (selectedGroupeVendeur && parseInt(selectedAnnee) === currentYear) { // Ensure year comparison is correct
            try {
                 const projectionData = await objectifService.getProjectionCA(selectedGroupeVendeur, selectedAnnee);
                 newProjectionCA = projectionData[0];
                 setProjectionCA(newProjectionCA);
            } catch (projErr) {
                console.warn("Could not fetch projection data:", projErr);
                setProjectionCA(null); // Reset projection if fetch fails
            }
        } else {
          setProjectionCA(null);
        }

        // Update focused chart data (logic remains the same)
        if (isOpen && focusedChartInfo) {
             // ... existing update logic ...
             console.log("Objectifs: Checking if focused chart needs update. ID:", focusedChartInfo.id);
             const newComparisonData = objectifsData.map(item => ({
                Groupe_Vendeur: item.Nom_Commercial || item.Groupe_Vendeur,
                Objectif: parseFloat(item.Objectif_Commercial || 0),
                Realisation: parseFloat(item.CA || 0)
            }));
            const newEvolutionChartData = evolutionDataRes.map(item => ({
                Annee: item.Annee.toString(),
                Objectif: parseFloat(selectedGroupeVendeur ? item.Objectif_Commercial : item.Objectif_Total || 0),
                CA: parseFloat(selectedGroupeVendeur ? item.CA : item.CA_Total || 0),
            })).sort((a, b) => parseInt(a.Annee) - parseInt(b.Annee)); // Sort here after mapping

            switch (focusedChartInfo.id) {
                case 'objectifs-taux-completion-bar':
                    updateFocusedChartData('objectifs-taux-completion-bar', tauxCompletionData);
                    break;
                case 'objectifs-comparison':
                    updateFocusedChartData('objectifs-comparison', newComparisonData);
                    break;
                case 'objectifs-evolution':
                    updateFocusedChartData('objectifs-evolution', newEvolutionChartData);
                    break;
                case 'objectifs-completion-gauge':
                    const newObjectifTotal = objectifsData.reduce((acc, curr) => acc + parseFloat(curr.Objectif_Commercial || 0), 0);
                    const newCaTotal = objectifsData.reduce((acc, curr) => acc + parseFloat(curr.CA || 0), 0);
                    const newTauxCompletionGlobal = newObjectifTotal !== 0 ? ((newCaTotal / newObjectifTotal) * 100) : 0;
                    updateFocusedChartData('objectifs-completion-gauge', [{ value: parseFloat(newTauxCompletionGlobal.toFixed(2)) }]);
                    break;
                default:
                    break;
            }
        }

      } catch (err) {
        console.error('Erreur données Objectifs:', err);
        setDataError('Erreur récupération données Objectifs.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [selectedAnnee, selectedGroupeVendeur, isOpen, focusedChartInfo, updateFocusedChartData]);

  // Filter Change Handler (useCallback remains the same)
  const handleFilterChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'annee') setSelectedAnnee(value);
    if (name === 'groupe-vendeur') setSelectedGroupeVendeur(value);
  }, []);

  // KPI Calculations useMemo (definitions remain the same)
  const objectifTotal = useMemo(() => objectifs.reduce((acc, curr) => acc + parseFloat(curr.Objectif_Commercial || 0), 0), [objectifs]);
  const caTotal = useMemo(() => objectifs.reduce((acc, curr) => acc + parseFloat(curr.CA || 0), 0), [objectifs]);
  const tauxCompletionMoyen = useMemo(() => {
      if (tauxCompletion.length === 0) return 0;
      const total = tauxCompletion.reduce((acc, curr) => acc + parseFloat(curr.Taux_Completion || 0), 0);
      return (total / tauxCompletion.length).toFixed(2);
  }, [tauxCompletion]);
  const tauxCompletionGlobal = useMemo(() => objectifTotal !== 0 ? parseFloat(((caTotal / objectifTotal) * 100).toFixed(2)) : 0, [caTotal, objectifTotal]);

  // Chart Data Calculations useMemo
  const comparisonData = useMemo(() => {
    const data = objectifs.map(item => ({
      Groupe_Vendeur: item.Nom_Commercial || item.Groupe_Vendeur,
      Objectif: parseFloat(item.Objectif_Commercial || 0),
      Realisation: parseFloat(item.CA || 0)
    }));
    // --- DEBUGGING: Log calculated comparison data ---
    console.log("[Objectifs Page] Calculated comparisonData:", data);
    // --------------------------------------------------
    return data;
  }, [objectifs]);

  const evolutionChartData = useMemo(() => {
    const data = evolutionData.map(item => ({
      Annee: item.Annee.toString(),
      Objectif: parseFloat(selectedGroupeVendeur ? item.Objectif_Commercial : item.Objectif_Total || 0),
      CA: parseFloat(selectedGroupeVendeur ? item.CA : item.CA_Total || 0),
    })).sort((a, b) => parseInt(a.Annee) - parseInt(b.Annee));
    // --- DEBUGGING: Log calculated evolution data ---
    console.log("[Objectifs Page] Calculated evolutionChartData:", data);
    // -------------------------------------------------
    return data;
  }, [evolutionData, selectedGroupeVendeur]);

  const { best, worst } = useMemo(() => {
    // ... existing best/worst logic ...
      if (tauxCompletion.length === 0) return { best: null, worst: null };
      const sorted = [...tauxCompletion].sort((a, b) => parseFloat(b.Taux_Completion || 0) - parseFloat(a.Taux_Completion || 0));
    return {
      best: sorted[0],
      worst: sorted[sorted.length - 1]
    };
  }, [tauxCompletion]);

  // Filter Definition for Dialogs (uses context data)
  const objectifsFilterDefinition = useMemo(() => ({
      config: [
          { id: 'annee', label: 'Année', options: annees, value: selectedAnnee },
          { id: 'groupe-vendeur', label: 'Groupe Vendeur', options: groupesVendeurs.map(g => ({ value: g.id, label: g.nom })), value: selectedGroupeVendeur }
      ],
      onChange: handleFilterChange
  }), [annees, selectedAnnee, groupesVendeurs, selectedGroupeVendeur, handleFilterChange]);

  const evolutionFilterDefinition = useMemo(() => ({
      config: [
           { id: 'groupe-vendeur', label: 'Groupe Vendeur', options: groupesVendeurs.map(g => ({ value: g.id, label: g.nom })), value: selectedGroupeVendeur }
      ],
       onChange: handleFilterChange
  }), [groupesVendeurs, selectedGroupeVendeur, handleFilterChange]);


  // --- Render Logic ---
  const showLoading = loadingData;
  const displayError = dataError;

  if (showLoading) {
    // ... loading JSX ...
        return (
      <Layout title="Objectifs">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (displayError) {
    // ... error JSX ...
     return (
      <Layout title="Objectifs">
        <Alert severity="error" sx={{ margin: 2 }}>{displayError}</Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Objectifs">
      {/* Filtres (uses context data `annees` and `groupesVendeurs`) */}
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
              {/* Map over `annees` from context */}
              {annees.map(annee => (
                <MenuItem key={annee} value={annee}>{annee}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Groupe Vendeur Filter */}
          <FormControl sx={{ minWidth: 200 }} disabled={!groupesVendeurs || groupesVendeurs.length === 0 || loadingData}>
            <InputLabel id="groupe-vendeur-label">Groupe Vendeur</InputLabel>
            <Select
              labelId="groupe-vendeur-label"
              id="groupe-vendeur-select"
              value={selectedGroupeVendeur}
              label="Groupe Vendeur"
              name="groupe-vendeur"
              onChange={handleFilterChange}
            >
              <MenuItem value=""><em>Tous les groupes</em></MenuItem>
              {/* Map over `groupesVendeurs` from context */} 
              {groupesVendeurs.map(g => (
                <MenuItem key={g.id} value={g.id}>{g.nom}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* KPIs & Projection (logic remains the same) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
        <KpiCard 
            title="Objectif Total"
            value={objectifTotal.toLocaleString('fr-FR')}
          unit="€" 
            icon={<TrackChangesIcon fontSize="large" />}
          color="#3498db" 
        />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <KpiCard 
            title="CA Total Réalisé"
            value={caTotal.toLocaleString('fr-FR')}
          unit="€" 
            icon={<MonetizationOnIcon fontSize="large" />}
          color="#2ecc71" 
        />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <KpiCard 
            title="Taux Compl. Global"
            value={tauxCompletionGlobal}
          unit="%" 
            icon={<CheckCircleIcon fontSize="large" />}
            color="#e67e22"
          />
        </Grid>
        {projectionCA && (
          <Grid item xs={12} sm={6} md={3}>
             <KpiCard
              title="Projection Fin Année"
              value={parseFloat(projectionCA.Projection_CA || 0).toLocaleString('fr-FR')}
              unit="€"
              icon={<OnlinePredictionIcon fontSize="large" />}
              color="#9b59b6"
             />
          </Grid>
        )}
      </Grid>

      {/* Meilleur / Pire Groupe (logic remains the same) */}
       {best && worst && !selectedGroupeVendeur && (
          <Grid item xs={12}>
            <Grid container spacing={3} sx={{mb: 3}}>
              <Grid item xs={12} md={6}>
                 <Card>
                    <CardHeader title="Meilleur Groupe" sx={{ bgcolor: 'success.light', textAlign: 'center' }} titleTypographyProps={{ fontWeight: 'bold' }} />
                    <CardContent>
                       <Typography variant="h6" align="center" gutterBottom>{best.Nom_Commercial || `Groupe ${best.Groupe_Vendeur}`}</Typography>
                       <Typography variant="h4" align="center" color="success.main">{parseFloat(best.Taux_Completion || 0).toFixed(2)}%</Typography>
                       <Typography variant="body2" align="center" color="text.secondary">Taux de Completion</Typography>
                    </CardContent>
                 </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                 <Card>
                    <CardHeader title="Pire Groupe" sx={{ bgcolor: 'error.light', textAlign: 'center' }} titleTypographyProps={{ fontWeight: 'bold' }} />
                    <CardContent>
                       <Typography variant="h6" align="center" gutterBottom>{worst.Nom_Commercial || `Groupe ${worst.Groupe_Vendeur}`}</Typography>
                       <Typography variant="h4" align="center" color="error.main">{parseFloat(worst.Taux_Completion || 0).toFixed(2)}%</Typography>
                       <Typography variant="body2" align="center" color="text.secondary">Taux de Completion</Typography>
                    </CardContent>
                 </Card>
              </Grid>
            </Grid>
          </Grid>
        )}

      {/* Graphiques (use updated filter definitions) */}
      <Grid container spacing={3}>
        {/* Taux Complétion par Groupe (Bar) */}
        <Grid item xs={12} md={6}>
          {(() => {
            const chartTitle = `Taux Complétion Objectifs (${selectedAnnee}${selectedGroupeVendeur ? ` / ${groupesVendeurs.find(g => g.id === selectedGroupeVendeur)?.nom || selectedGroupeVendeur}` : ' (Global)'})`;
            const chartProps = { xKey:"Groupe_Vendeur", yKey:"Taux_Completion", title: chartTitle, color:"#e74c3c", yAxisLabel:"%" };
            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'objectifs-taux-completion-bar',
                        type: 'bar',
                        title: chartTitle,
                        chartProps: chartProps,
                        chartData: tauxCompletion,
                        filterDefinition: objectifsFilterDefinition // Use updated definition
                    })}
                    sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                >
                    <BarChart data={tauxCompletion} {...chartProps} />
                </Box>
            );
          })()}
        </Grid>

        {/* Objectif vs Réalisation (Comparison/Bar) */}
        <Grid item xs={12} md={6}>
          {(() => {
            const chartTitle = `Objectif vs Réalisation (${selectedAnnee}${selectedGroupeVendeur ? ` / ${groupesVendeurs.find(g => g.id === selectedGroupeVendeur)?.nom || selectedGroupeVendeur}` : ' (Global)'})`;
            // ChartProps for ComparisonChart needs data directly
            const chartProps = {
                data: comparisonData,
                xKey: "Groupe_Vendeur",
                bar1Key: "Objectif",
                bar2Key: "Realisation",
                bar1Name: "Objectif (€)",
                bar2Name: "Réalisé (€)",
                title: chartTitle
            };
            const dialogChartProps = { ...chartProps }; // Clone for dialog
            delete dialogChartProps.data; // Remove data for dialog props

            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'objectifs-comparison',
                        type: 'comparison',
                        title: chartTitle,
                        chartProps: dialogChartProps, // Pass props without data
                        chartData: comparisonData, // Pass data separately
                        filterDefinition: objectifsFilterDefinition // Use updated definition
                    })}
                    sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                >
                    <ComparisonChart {...chartProps} />
                </Box>
            );
          })()}
        </Grid>

        {/* Évolution Objectifs/CA (Line) */}
        <Grid item xs={12} md={6}>
          {(() => {
            const chartTitle = `Évolution Objectif vs CA ${selectedGroupeVendeur ? `(${groupesVendeurs.find(g => g.id === selectedGroupeVendeur)?.nom || selectedGroupeVendeur})` : '(Global)'}`;
            const chartProps = {
                xKey: "Annee",
                yKeys: ["Objectif", "CA"],
                colors: ["#e74c3c", "#2ecc71"],
                title: chartTitle
            };
            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'objectifs-evolution',
                        type: 'line',
                        title: chartTitle,
                        chartProps: chartProps,
                        chartData: evolutionChartData,
                        filterDefinition: evolutionFilterDefinition // Use specific definition
                    })}
                    sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                >
                    <LineChart data={evolutionChartData} {...chartProps} />
                </Box>
            );
          })()}
        </Grid>

         {/* Taux Complétion Global (Gauge) */}
        <Grid item xs={12} md={6}>
          {(() => {
            const chartTitle = `Taux Complétion Global (${selectedAnnee}${selectedGroupeVendeur ? ` / ${groupesVendeurs.find(g => g.id === selectedGroupeVendeur)?.nom || selectedGroupeVendeur}` : ''})`;
            const gaugeValue = tauxCompletionGlobal;
            const chartProps = { value: gaugeValue, title: chartTitle };
            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'objectifs-completion-gauge',
                        type: 'gauge',
                        title: chartTitle,
                        chartProps: { title: chartTitle },
                        chartData: [{ value: gaugeValue }],
                        filterDefinition: objectifsFilterDefinition // Use updated definition
                    })}
                    sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                 >
                    <GaugeChart {...chartProps} />
                 </Box>
            );
          })()}
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Objectifs; 