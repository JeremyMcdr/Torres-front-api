import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import KpiCard from '../components/KpiCard';
import { motifService } from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [filterError, setFilterError] = useState(null);

  const [annees, setAnnees] = useState([]);
  const [motifsOptions, setMotifsOptions] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedMotif, setSelectedMotif] = useState('');

  const [pourcentageMotifs, setPourcentageMotifs] = useState([]);

  // Fetch Filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setFilterError(null);
        const [motifsData, pourcentageAllYears] = await Promise.all([
          motifService.getAvailableMotifs(),
          motifService.getPourcentageMotifsByAnnee({}) // Pour les années
        ]);

        setMotifsOptions(motifsData.map(item => item.Motif_Commande).sort());

        const years = [...new Set(pourcentageAllYears.map(item => item.Annee))].sort((a, b) => b - a);
        setAnnees(years);

        if (years.length > 0) setSelectedAnnee(years[0]);
        else setSelectedAnnee('all');

      } catch (err) {
        console.error('Erreur filtres:', err);
        setFilterError('Erreur récupération options filtre.');
      }
    };
    fetchFilters();
  }, []);

  // Fetch Data
  useEffect(() => {
    if (!selectedAnnee) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingError(null);

        const filters = {
          annee: selectedAnnee !== 'all' ? selectedAnnee : undefined,
          motif: selectedMotif || undefined,
        };

        const pourcentageData = await motifService.getPourcentageMotifsByAnnee(filters);
        setPourcentageMotifs(pourcentageData);

        setLoading(false);
      } catch (err) {
        console.error('Erreur données:', err);
        setLoadingError('Erreur récupération données.');
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedAnnee, selectedMotif]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === 'annee') setSelectedAnnee(value);
    if (name === 'motif') setSelectedMotif(value);
  };

  // KPIs Calculation (Memoized)
  const { motifPrincipal, pourcentageMotifPrincipal } = useMemo(() => {
    if (pourcentageMotifs.length === 0) return { motifPrincipal: 'N/A', pourcentageMotifPrincipal: 0 };
    // Filter out motifs with 0 percentage before sorting if needed, or handle directly
    const sortedMotifs = [...pourcentageMotifs].sort((a, b) => parseFloat(b.Pourcentage || 0) - parseFloat(a.Pourcentage || 0));
    const principal = sortedMotifs[0];
    return {
      motifPrincipal: principal?.Motif_Commande || 'N/A',
      pourcentageMotifPrincipal: parseFloat(principal?.Pourcentage || 0).toFixed(2)
    };
  }, [pourcentageMotifs]);

  const nombreMotifs = useMemo(() => new Set(pourcentageMotifs.map(m => m.Motif_Commande)).size, [pourcentageMotifs]);

  // Loading / Error Render
  if (loading && !loadingError) {
    return (
      <Layout title="Motifs de commande">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const renderError = filterError || loadingError;
  if (renderError) {
    return (
      <Layout title="Motifs de commande">
        <Alert severity="error" sx={{ margin: 2 }}>{renderError}</Alert>
      </Layout>
    );
  }

  // Main Render
  return (
    <Layout title="Motifs de commande">
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
              {motifsOptions.map(motif => (
                <MenuItem key={motif} value={motif}>{motif}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <KpiCard
            title="Nombre de Motifs (Filt.)"
            value={nombreMotifs}
            icon={<ListAltIcon fontSize="large" />}
            color="#3498db"
          />
        </Grid>
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

      {/* Graphiques */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <PieChart
            data={pourcentageMotifs}
            nameKey="Motif_Commande"
            valueKey="Pourcentage"
            title={`Répartition (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee}${selectedMotif ? ` / ${selectedMotif}`: ''})`}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BarChart
            data={pourcentageMotifs}
            xKey="Motif_Commande"
            yKey="Pourcentage"
            title={`% par Motif (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee}${selectedMotif ? ` / ${selectedMotif}`: ''})`}
            color="#2ecc71"
          />
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Motifs; 