import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import KpiCard from '../components/KpiCard';
import { caService } from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [filterError, setFilterError] = useState(null);

  // États pour les filtres
  const [annees, setAnnees] = useState([]);
  const [pays, setPays] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState(''); // Initialiser à vide
  const [selectedPays, setSelectedPays] = useState('');

  // États pour les données
  const [caTotal, setCATotal] = useState(0);
  const [caParPays, setCAParPays] = useState([]);
  const [caParVendeur, setCAParVendeur] = useState([]);
  const [caParAnnee, setCAParAnnee] = useState([]);

  // Récupérer les années et pays disponibles
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setFilterError(null);
        const yearsData = await caService.getAvailableYears();
        const countriesData = await caService.getAvailableCountries();

        const yearOptions = yearsData.map(item => item.Annee).sort((a, b) => b - a); // Trier desc
        const countryOptions = countriesData.map(item => item.Pays).sort();

        setAnnees(yearOptions);
        setPays(countryOptions);

        // Définir l'année la plus récente comme valeur par défaut si elle existe
        if (yearOptions.length > 0) {
          setSelectedAnnee(yearOptions[0]);
        } else {
           setSelectedAnnee('all'); // Fallback si aucune année n'est trouvée
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
    // Ne fetch que si l'année sélectionnée est définie (après le fetch initial des filtres)
    if (!selectedAnnee) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingError(null);

        const currentYear = selectedAnnee === 'all' ? new Date().getFullYear() : selectedAnnee;

        // Utiliser une promesse pour paralléliser les appels
        const [caTotalData, caParPaysData, caParVendeurData, allYearsDataRes] = await Promise.all([
          caService.getCATotalByAnnee(currentYear), // CA Total de l'année pour KPI
          caService.getCAByPaysAnnee({ annee: selectedAnnee !== 'all' ? selectedAnnee : undefined, pays: selectedPays || undefined }),
          caService.getCAByVendeurAnnee({ annee: selectedAnnee !== 'all' ? selectedAnnee : undefined }),
          Promise.all(annees.map(year => caService.getCATotalByAnnee(year))) // CA pour l'évolution annuelle
        ]);

        setCATotal(caTotalData[0]?.CA_Total || 0);
        setCAParPays(caParPaysData);
        setCAParVendeur(caParVendeurData);

        const allYearsFormatted = allYearsDataRes
            .map((res, index) => ({ Annee: annees[index], CA: res[0]?.CA_Total || 0 }))
            .sort((a, b) => a.Annee - b.Annee); // Trier par année asc
        setCAParAnnee(allYearsFormatted);

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setLoadingError('Erreur lors de la récupération des données. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedAnnee, selectedPays, annees]); // Dépend de annees pour l'évolution

  // Handler pour Select MUI
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === 'annee') {
      setSelectedAnnee(value);
    }
    if (name === 'pays') {
      setSelectedPays(value);
    }
  };

  // Rendu Chargement
  if (loading && !loadingError) {
    return (
      <Layout title="Chiffre d'affaires">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  // Rendu Erreur (Filtres ou Données)
  const renderError = filterError || loadingError;
  if (renderError) {
    return (
      <Layout title="Chiffre d'affaires">
        <Alert severity="error" sx={{ margin: 2 }}>{renderError}</Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Chiffre d'affaires">
      {/* Section Filtres */}
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
            <InputLabel id="pays-label">Pays</InputLabel>
            <Select
              labelId="pays-label"
              id="pays-select"
              value={selectedPays}
              label="Pays"
              name="pays"
              onChange={handleFilterChange}
            >
              <MenuItem value=""><em>Tous les pays</em></MenuItem>
              {pays.map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* KPIs */}
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

      {/* Graphiques */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <BarChart
            data={caParPays}
            xKey="Pays"
            yKey="CA"
            title={`CA par pays (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee}${selectedPays ? ` / ${selectedPays}` : ''})`}
            color="#3498db"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BarChart
            data={caParVendeur}
            xKey="Groupe_Vendeur"
            yKey="CA"
            title={`CA par groupe de vendeurs (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee})`}
            color="#2ecc71"
          />
        </Grid>
        <Grid item xs={12}> {/* Prend toute la largeur */}
          <LineChart
            data={caParAnnee}
            xKey="Annee"
            yKey="CA"
            title="Évolution du CA par année"
            color="#e74c3c"
          />
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ChiffreAffaires; 