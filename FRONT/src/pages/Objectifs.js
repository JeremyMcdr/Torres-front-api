import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import GaugeChart from '../components/charts/GaugeChart';
import ComparisonChart from '../components/charts/ComparisonChart';
import KpiCard from '../components/KpiCard';
import { objectifService, commercialService } from '../services/api';
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

        if (yearOptions.length > 0) setSelectedAnnee(yearOptions[0]);
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
        const filters = {
          annee: selectedAnnee !== 'all' ? selectedAnnee : undefined,
          groupe_vendeur: selectedGroupeVendeur || undefined,
        };

        const [objectifsData, tauxCompletionData, evolutionDataRes] = await Promise.all([
          objectifService.getObjectifsCommerciaux(filters),
          objectifService.getTauxCompletionObjectifs(filters),
          objectifService.getEvolutionObjectifsCA(filters.groupe_vendeur) // Evolution depends only on group
        ]);

        setObjectifs(objectifsData);
        setTauxCompletion(tauxCompletionData);
        setEvolutionData(evolutionDataRes);

        // Fetch projection only if a group is selected and it's the current year
        if (selectedGroupeVendeur && selectedAnnee === currentYear) {
          const projectionData = await objectifService.getProjectionCA(selectedGroupeVendeur, selectedAnnee);
          setProjectionCA(projectionData[0]);
        } else {
          setProjectionCA(null);
        }

        setLoading(false);
      } catch (err) {
        console.error('Erreur données:', err);
        setLoadingError('Erreur récupération données.');
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedAnnee, selectedGroupeVendeur]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === 'annee') setSelectedAnnee(value);
    if (name === 'groupe-vendeur') setSelectedGroupeVendeur(value);
  };

  // --- Calculations (Memoized) ---
  const objectifTotal = useMemo(() => objectifs.reduce((acc, curr) => acc + parseFloat(curr.Objectif_Commercial || 0), 0), [objectifs]);
  const caTotal = useMemo(() => objectifs.reduce((acc, curr) => acc + parseFloat(curr.CA || 0), 0), [objectifs]);
  const tauxCompletionMoyen = useMemo(() => {
      if (tauxCompletion.length === 0) return 0;
      const total = tauxCompletion.reduce((acc, curr) => acc + parseFloat(curr.Taux_Completion || 0), 0);
      return (total / tauxCompletion.length).toFixed(2);
  }, [tauxCompletion]);

  const tauxCompletionGlobal = useMemo(() => objectifTotal !== 0 ? ((caTotal / objectifTotal) * 100).toFixed(2) : 0, [caTotal, objectifTotal]);

  const comparisonData = useMemo(() => objectifs.map(item => ({
    Groupe_Vendeur: item.Nom_Commercial || item.Groupe_Vendeur,
    Objectif: parseFloat(item.Objectif_Commercial || 0),
    Realisation: parseFloat(item.CA || 0)
  })), [objectifs]);

  const evolutionChartData = useMemo(() => evolutionData.map(item => ({
    Annee: item.Annee.toString(),
    Objectif: parseFloat(selectedGroupeVendeur ? item.Objectif_Commercial : item.Objectif_Total || 0),
    CA: parseFloat(selectedGroupeVendeur ? item.CA : item.CA_Total || 0),
  })), [evolutionData, selectedGroupeVendeur]);

  const { best, worst } = useMemo(() => {
      if (tauxCompletion.length === 0) return { best: null, worst: null };
      const sorted = [...tauxCompletion].sort((a, b) => parseFloat(b.Taux_Completion || 0) - parseFloat(a.Taux_Completion || 0));
      return {
        best: sorted[0],
        worst: sorted[sorted.length - 1]
      };
  }, [tauxCompletion]);

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
            >
              <MenuItem value="all"><em>Toutes les années</em></MenuItem>
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
              name="groupe-vendeur"
              onChange={handleFilterChange}
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
              title={`Projection CA ${selectedAnnee}`}
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
    </Layout>
  );
};

export default Objectifs; 