import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import GaugeChart from '../components/charts/GaugeChart';
import ComparisonChart from '../components/charts/ComparisonChart';
import KpiCard from '../components/KpiCard';
import { objectifService, commercialService } from '../services/api';
import { useFocusChart } from '../context/FocusChartContext';
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
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [filterError, setFilterError] = useState(null);

  const [annees, setAnnees] = useState([]);
  const [groupesVendeurs, setGroupesVendeurs] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedGroupeVendeur, setSelectedGroupeVendeur] = useState('');

  const [objectifs, setObjectifs] = useState([]);
  const [tauxCompletion, setTauxCompletion] = useState([]);
  const [projectionCA, setProjectionCA] = useState(null);
  const [evolutionData, setEvolutionData] = useState([]);

  // Get context functions and state
  const { openFocusDialog, isOpen, focusedChartInfo, updateFocusedChartData } = useFocusChart();

  // Fetch Filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setFilterError(null);
        const [groupesData, objectifsAllYears] = await Promise.all([
          commercialService.getAvailableGroupesVendeurs(),
          objectifService.getObjectifsCommerciaux({}) // Pour les années
        ]);

        const groupOptions = groupesData.sort((a, b) => (a.Nom_Commercial || '').localeCompare(b.Nom_Commercial || ''));
        setGroupesVendeurs(groupOptions);

        const yearOptions = [...new Set(objectifsAllYears.map(item => item.Annee))].sort((a, b) => b - a);
        setAnnees(yearOptions);

        if (yearOptions.length > 0) {
            setSelectedAnnee(yearOptions[0]);
        } else {
            const currentYear = new Date().getFullYear();
            setSelectedAnnee(currentYear); // Fallback
            setAnnees([currentYear]);
            console.warn('Aucune année avec des données d\'objectifs trouvée, utilisation de l\'année en cours.')
        }
        // Keep selectedGroupeVendeur empty initially to show "Tous les groupes"

      } catch (err) {
        console.error('Erreur filtres:', err);
        setFilterError('Erreur récupération options filtre.');
      }
    };
    fetchFilters();
  }, []);

  // Fetch Data based on Filters
  useEffect(() => {
    if (!selectedAnnee) return; // Wait for filters to load

    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingError(null);

        const currentYear = new Date().getFullYear();
        const anneeFilterValue = selectedAnnee !== 'all' ? selectedAnnee : undefined;
        const groupeFilterValue = selectedGroupeVendeur || undefined;

        const filters = {
          annee: anneeFilterValue,
          groupe_vendeur: groupeFilterValue,
        };

        const [objectifsData, tauxCompletionData, evolutionDataRes] = await Promise.all([
          objectifService.getObjectifsCommerciaux(filters),
          objectifService.getTauxCompletionObjectifs(filters),
          objectifService.getEvolutionObjectifsCA(groupeFilterValue) // Evolution depends only on group
        ]);

        // Update local state
        setObjectifs(objectifsData);
        setTauxCompletion(tauxCompletionData);
        setEvolutionData(evolutionDataRes);

        // Fetch projection only if a group is selected and it's the current year
        let newProjectionCA = null;
        if (selectedGroupeVendeur && selectedAnnee === currentYear) {
          const projectionData = await objectifService.getProjectionCA(selectedGroupeVendeur, selectedAnnee);
          newProjectionCA = projectionData[0];
          setProjectionCA(newProjectionCA);
        } else {
          setProjectionCA(null);
        }

        // Update focused chart data if dialog is open
        if (isOpen && focusedChartInfo) {
            console.log("Objectifs: Checking if focused chart needs update. ID:", focusedChartInfo.id);
             // Memoized calculation depends on objectifsData
            const newComparisonData = objectifsData.map(item => ({
                Groupe_Vendeur: item.Nom_Commercial || item.Groupe_Vendeur,
                Objectif: parseFloat(item.Objectif_Commercial || 0),
                Realisation: parseFloat(item.CA || 0)
            }));
             // Memoized calculation depends on evolutionDataRes
            const newEvolutionChartData = evolutionDataRes.map(item => ({
                Annee: item.Annee.toString(),
                Objectif: parseFloat(selectedGroupeVendeur ? item.Objectif_Commercial : item.Objectif_Total || 0),
                CA: parseFloat(selectedGroupeVendeur ? item.CA : item.CA_Total || 0),
            }));

            switch (focusedChartInfo.id) {
                case 'objectifs-taux-completion-bar':
                    updateFocusedChartData('objectifs-taux-completion-bar', tauxCompletionData);
                    break;
                case 'objectifs-comparison':
                    updateFocusedChartData('objectifs-comparison', newComparisonData);
                    break;
                case 'objectifs-evolution':
                     // Check if the focused chart ID matches and update
                    updateFocusedChartData('objectifs-evolution', newEvolutionChartData);
                    break;
                case 'objectifs-completion-gauge':
                     // Calculate the global completion rate based on the new data
                    const newObjectifTotal = objectifsData.reduce((acc, curr) => acc + parseFloat(curr.Objectif_Commercial || 0), 0);
                    const newCaTotal = objectifsData.reduce((acc, curr) => acc + parseFloat(curr.CA || 0), 0);
                    const newTauxCompletionGlobal = newObjectifTotal !== 0 ? ((newCaTotal / newObjectifTotal) * 100) : 0;
                    // Gauge often takes a single value, ensure it's formatted correctly for the component
                    updateFocusedChartData('objectifs-completion-gauge', [{ value: parseFloat(newTauxCompletionGlobal.toFixed(2)) }]);
                    break;
                // Add cases for other charts if they become focusable
                default:
                    break;
            }
        }

        setLoading(false);
      } catch (err) {
        console.error('Erreur données:', err);
        setLoadingError('Erreur récupération données.');
        setLoading(false);
      }
    };
    fetchData();
   // Add context dependencies
  }, [selectedAnnee, selectedGroupeVendeur, isOpen, focusedChartInfo, updateFocusedChartData]);

  // Use useCallback for stability
  const handleFilterChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'annee') setSelectedAnnee(value);
    if (name === 'groupe-vendeur') setSelectedGroupeVendeur(value);
  }, []); // Dependencies only setters

  // --- Calculations (Memoized - definitions remain mostly the same, but ensure dependencies are correct) ---
  const objectifTotal = useMemo(() => objectifs.reduce((acc, curr) => acc + parseFloat(curr.Objectif_Commercial || 0), 0), [objectifs]);
  const caTotal = useMemo(() => objectifs.reduce((acc, curr) => acc + parseFloat(curr.CA || 0), 0), [objectifs]);
  const tauxCompletionMoyen = useMemo(() => {
      if (tauxCompletion.length === 0) return 0;
      const total = tauxCompletion.reduce((acc, curr) => acc + parseFloat(curr.Taux_Completion || 0), 0);
      return (total / tauxCompletion.length).toFixed(2);
  }, [tauxCompletion]);

  const tauxCompletionGlobal = useMemo(() => objectifTotal !== 0 ? parseFloat(((caTotal / objectifTotal) * 100).toFixed(2)) : 0, [caTotal, objectifTotal]);

  const comparisonData = useMemo(() => objectifs.map(item => ({
    Groupe_Vendeur: item.Nom_Commercial || item.Groupe_Vendeur,
    Objectif: parseFloat(item.Objectif_Commercial || 0),
    Realisation: parseFloat(item.CA || 0)
  })), [objectifs]);

  const evolutionChartData = useMemo(() => evolutionData.map(item => ({
    Annee: item.Annee.toString(), // Ensure Annee is a string for chart keys
    Objectif: parseFloat(selectedGroupeVendeur ? item.Objectif_Commercial : item.Objectif_Total || 0),
    CA: parseFloat(selectedGroupeVendeur ? item.CA : item.CA_Total || 0),
  })).sort((a, b) => parseInt(a.Annee) - parseInt(b.Annee)), [evolutionData, selectedGroupeVendeur]); // Sort by year


  const { best, worst } = useMemo(() => {
    // ... (existing best/worst logic remains the same) ...
      if (tauxCompletion.length === 0) return { best: null, worst: null };
      const sorted = [...tauxCompletion].sort((a, b) => parseFloat(b.Taux_Completion || 0) - parseFloat(a.Taux_Completion || 0));
      return {
        best: sorted[0],
        worst: sorted[sorted.length - 1]
      };
  }, [tauxCompletion]);

  // Filter Definition for Dialogs
  const objectifsFilterDefinition = useMemo(() => ({
      config: [
          { id: 'annee', label: 'Année', options: annees, value: selectedAnnee },
          { id: 'groupe-vendeur', label: 'Groupe Vendeur', options: groupesVendeurs.map(g => ({ value: g.Groupe_Vendeur, label: g.Nom_Commercial || `Groupe ${g.Groupe_Vendeur}` })), value: selectedGroupeVendeur }
      ],
      onChange: handleFilterChange
  }), [annees, selectedAnnee, groupesVendeurs, selectedGroupeVendeur, handleFilterChange]);

  // Filter definition only for Evolution chart (group only)
  const evolutionFilterDefinition = useMemo(() => ({
      config: [
           { id: 'groupe-vendeur', label: 'Groupe Vendeur', options: groupesVendeurs.map(g => ({ value: g.Groupe_Vendeur, label: g.Nom_Commercial || `Groupe ${g.Groupe_Vendeur}` })), value: selectedGroupeVendeur }
      ],
       onChange: handleFilterChange
  }), [groupesVendeurs, selectedGroupeVendeur, handleFilterChange]);

  // --- Render Loading/Error ---
  if (loading && !loadingError) {
    return (
      <Layout title="Objectifs">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const renderError = filterError || loadingError;
  if (renderError) {
    return (
      <Layout title="Objectifs">
        <Alert severity="error" sx={{ margin: 2 }}>{renderError}</Alert>
      </Layout>
    );
  }

  // --- Render Page ---
  return (
    <Layout title="Objectifs">
      {/* Filtres */}
      <Paper sx={{ padding: 2, marginBottom: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="annee-label">Année</InputLabel>
            <Select
              labelId="annee-label"
              id="annee-select"
              value={selectedAnnee}
              label="Année"
              name="annee"
              onChange={handleFilterChange}
              disabled={loading}
            >
              {/* <MenuItem value="all"><em>Toutes les années</em></MenuItem> Removed 'all' as evolution handles aggregation */}
              {annees.map(annee => (
                <MenuItem key={annee} value={annee}>{annee}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="groupe-vendeur-label">Groupe Vendeur</InputLabel>
            <Select
              labelId="groupe-vendeur-label"
              id="groupe-vendeur-select"
              value={selectedGroupeVendeur}
              label="Groupe Vendeur"
              name="groupe-vendeur" // Use hyphenated name consistent with handler
              onChange={handleFilterChange}
              disabled={loading}
            >
              <MenuItem value=""><em>Tous les groupes</em></MenuItem>
              {groupesVendeurs.map(g => (
                <MenuItem key={g.Groupe_Vendeur} value={g.Groupe_Vendeur}>
                  {g.Nom_Commercial || `Groupe ${g.Groupe_Vendeur}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* KPIs & Projection */}
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

      {/* Contenu Principal (Graphiques, Meilleur/Pire) */}
      <Grid container spacing={3}>
        {/* Graphique Comparaison Objectif/Réalisation */}
        {comparisonData.length > 0 && !selectedGroupeVendeur && (
            <Grid item xs={12} md={6}>
                 <ComparisonChart
                    data={comparisonData}
                    xKey="Groupe_Vendeur"
                    yKey1="Objectif"
                    yKey2="Realisation"
                    title={`Objectif vs Réalisation (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee})`}
                    label1="Objectif (€)"
                    label2="Réalisation (€)"
                 />
            </Grid>
        )}

         {/* Gauge Chart si un groupe est sélectionné */}
        {selectedGroupeVendeur && tauxCompletion.length > 0 && (
          <Grid item xs={12} md={6}>
            <GaugeChart
              value={parseFloat(tauxCompletion[0]?.Taux_Completion || 0)}
              title={`Taux Completion - ${tauxCompletion[0]?.Nom_Commercial || selectedGroupeVendeur} (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee})`}
              max={100}
            />
          </Grid>
        )}

        {/* Graphique Évolution Objectifs/CA */}
        <Grid item xs={12} md={6}>
          <LineChart
            data={evolutionChartData}
            xKey="Annee"
            yKey="Objectif"
            secondaryKey="CA"
            title={`Évolution Objectifs vs CA ${selectedGroupeVendeur ? ('- ' + (groupesVendeurs.find(g => g.Groupe_Vendeur === selectedGroupeVendeur)?.Nom_Commercial || selectedGroupeVendeur)) : '(Tous)'}`}
            color="#e74c3c" // Objectif
            secondaryColor="#2ecc71" // CA
          />
        </Grid>

        {/* Meilleur et Pire Groupe (si aucun groupe spécifique n'est sélectionné) */}
        {best && worst && !selectedGroupeVendeur && (
          <Grid item xs={12}>
            <Grid container spacing={3}>
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

      </Grid>

      {/* Graphiques (Wrapped in clickable Box) */}
      <Grid container spacing={3}>
        {/* Taux Complétion par Groupe (Bar) */}
        <Grid item xs={12} md={6}>
          {(() => {
            const chartTitle = `Taux Complétion Objectifs (${selectedAnnee === 'all' ? 'Global' : selectedAnnee}${selectedGroupeVendeur ? ` / ${groupesVendeurs.find(g => g.Groupe_Vendeur === selectedGroupeVendeur)?.Nom_Commercial || selectedGroupeVendeur}` : ''})`;
            const chartProps = { xKey:"Groupe_Vendeur", yKey:"Taux_Completion", title: chartTitle, color:"#e74c3c", yAxisLabel:"%" };
            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'objectifs-taux-completion-bar',
                        type: 'bar',
                        title: chartTitle,
                        chartProps: chartProps,
                        chartData: tauxCompletion,
                        filterDefinition: objectifsFilterDefinition
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
            const chartTitle = `Objectif vs Réalisation (${selectedAnnee === 'all' ? 'Global' : selectedAnnee}${selectedGroupeVendeur ? ` / ${groupesVendeurs.find(g => g.Groupe_Vendeur === selectedGroupeVendeur)?.Nom_Commercial || selectedGroupeVendeur}` : ''})`;
            const chartProps = {
                data: comparisonData, // Pass data directly here
                xKey: "Groupe_Vendeur",
                bar1Key: "Objectif",
                bar2Key: "Realisation",
                bar1Name: "Objectif (€)",
                bar2Name: "Réalisé (€)",
                title: chartTitle
            };
             // Extract props needed for dialog (without data)
            const dialogChartProps = { ...chartProps };
            delete dialogChartProps.data;

            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'objectifs-comparison',
                        type: 'comparison', // Use the specific chart type
                        title: chartTitle,
                        chartProps: dialogChartProps,
                        chartData: comparisonData, // Pass the memoized data
                        filterDefinition: objectifsFilterDefinition
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
            const chartTitle = `Évolution Objectif vs CA ${selectedGroupeVendeur ? `(${groupesVendeurs.find(g => g.Groupe_Vendeur === selectedGroupeVendeur)?.Nom_Commercial || selectedGroupeVendeur})` : '(Global)'}`;
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
                        chartData: evolutionChartData, // Pass the memoized data
                        // Only allow filtering by group for evolution
                        filterDefinition: evolutionFilterDefinition
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
            const chartTitle = `Taux Complétion Global (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee}${selectedGroupeVendeur ? ` / ${groupesVendeurs.find(g => g.Groupe_Vendeur === selectedGroupeVendeur)?.Nom_Commercial || selectedGroupeVendeur}` : ''})`;
            // Gauge often takes a single value, not an array
            const gaugeValue = tauxCompletionGlobal;
            const chartProps = { value: gaugeValue, title: chartTitle };
            return (
                <Box
                    onClick={() => openFocusDialog({
                        id: 'objectifs-completion-gauge',
                        type: 'gauge',
                        title: chartTitle,
                        chartProps: { title: chartTitle }, // Pass non-data props
                        // Pass data in the format expected by update logic ({value: ...})
                        chartData: [{ value: gaugeValue }],
                        filterDefinition: objectifsFilterDefinition
                    })}
                    sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                 >
                    {/* Render Gauge normally on page */}
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