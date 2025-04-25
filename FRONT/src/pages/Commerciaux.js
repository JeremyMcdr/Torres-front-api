import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/charts/BarChart';
import KpiCard from '../components/KpiCard';
import { commercialService } from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [filterError, setFilterError] = useState(null);

  // États pour les filtres
  const [annees, setAnnees] = useState([]);
  const [commerciaux, setCommerciaux] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedCommercial, setSelectedCommercial] = useState('');

  // États pour les données
  const [pourcentageCommandes, setPourcentageCommandes] = useState([]);
  const [tauxReussite, setTauxReussite] = useState([]);
  const [tempsConversion, setTempsConversion] = useState([]);

  // Récupérer les années et commerciaux disponibles
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setFilterError(null);
        const [commerciauxData, tauxReussiteAllYears] = await Promise.all([
          commercialService.getAvailableCommerciaux(),
          commercialService.getTauxReussiteCommercial({}) // Pour obtenir toutes les années
        ]);

        const commerciauxList = commerciauxData.map(item => ({
          id: item.Commercial,
          nom: item.Nom_Commercial || `Commercial ${item.Commercial}`
        })).sort((a, b) => a.nom.localeCompare(b.nom));
        setCommerciaux(commerciauxList);

        const years = [...new Set(tauxReussiteAllYears.map(item => item.Annee))].sort((a, b) => b - a);
        setAnnees(years);

        if (years.length > 0) {
          setSelectedAnnee(years[0]);
        } else {
          setSelectedAnnee('all');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des filtres:', err);
        setFilterError('Erreur lors de la récupération des options de filtre.');
      }
    };
    fetchFilters();
  }, []);

  // Récupérer les données en fonction des filtres
  useEffect(() => {
    if (!selectedAnnee) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingError(null);

        const filters = {
          annee: selectedAnnee !== 'all' ? selectedAnnee : undefined,
          commercial: selectedCommercial || undefined,
        };

        const [pourcentageData, tauxReussiteData, tempsConversionData] = await Promise.all([
          commercialService.getPourcentageCommandesCommercial(filters),
          commercialService.getTauxReussiteCommercial(filters),
          commercialService.getTempsConversion(filters)
        ]);

        setPourcentageCommandes(pourcentageData);
        setTauxReussite(tauxReussiteData);
        setTempsConversion(tempsConversionData);

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setLoadingError('Erreur lors de la récupération des données. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedAnnee, selectedCommercial]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === 'annee') setSelectedAnnee(value);
    if (name === 'commercial') setSelectedCommercial(value);
  };

  // Calculer les KPIs
  const tauxReussiteMoyen = tauxReussite.length === 0 ? 0 : (tauxReussite.reduce((acc, curr) => acc + parseFloat(curr.Taux_Reussite || 0), 0) / tauxReussite.length).toFixed(2);
  const tempsConversionMoyen = tempsConversion.length === 0 ? 0 : (tempsConversion.reduce((acc, curr) => acc + parseFloat(curr.Temps_Moyen_Conversion || 0), 0) / tempsConversion.length).toFixed(1);
  const nombreConversionsTotal = tempsConversion.reduce((acc, curr) => acc + parseInt(curr.Nombre_Conversions || 0), 0);
  const nombreCommerciauxFiltres = new Set(pourcentageCommandes.map(c => c.Commercial)).size; // Compter les commerciaux uniques dans les données filtrées

  // Rendu Chargement
  if (loading && !loadingError) {
    return (
      <Layout title="Commerciaux">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  // Rendu Erreur
  const renderError = filterError || loadingError;
  if (renderError) {
    return (
      <Layout title="Commerciaux">
        <Alert severity="error" sx={{ margin: 2 }}>{renderError}</Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Commerciaux">
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
              {commerciaux.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.nom}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* KPIs */}
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

      {/* Graphiques */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <BarChart
            data={pourcentageCommandes}
            xKey="Nom_Commercial"
            yKey="Pourcentage_Commandes"
            title={`% Commandes (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee})`}
            color="#3498db"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BarChart
            data={tauxReussite}
            xKey="Nom_Commercial"
            yKey="Taux_Reussite"
            title={`Taux Réussite (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee})`}
            color="#2ecc71"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BarChart
            data={tempsConversion}
            xKey="Nom_Commercial"
            yKey="Temps_Moyen_Conversion"
            title={`Temps Conv. Moyen (jours) (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee})`}
            color="#9b59b6"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BarChart
            data={tempsConversion} // Utilise les mêmes données que le temps moyen
            xKey="Nom_Commercial"
            yKey="Nombre_Conversions"
            title={`Nombre Conversions (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee})`}
            color="#f39c12"
          />
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Commerciaux; 