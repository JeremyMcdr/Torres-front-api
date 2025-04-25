import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/charts/BarChart';
import KpiCard from '../components/KpiCard';
import { commercialService } from '../services/api';
import { useFocusChart } from '../context/FocusChartContext';

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

  // Get context functions and state
  const { openFocusDialog, isOpen, focusedChartInfo, updateFocusedChartData } = useFocusChart();

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
          const currentYear = new Date().getFullYear();
          setSelectedAnnee(currentYear);
          setAnnees([currentYear]);
          console.warn('Aucune année avec des données commerciales trouvée, utilisation de l\'année en cours.')
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

        // Fetch data, removing getNombreConversions call
        const [pourcentageData, tauxReussiteData, tempsConversionData] = await Promise.all([
          commercialService.getPourcentageCommandesCommercial(filters),
          commercialService.getTauxReussiteCommercial(filters),
          commercialService.getTempsConversion(filters)
          // Removed: commercialService.getNombreConversions(filters)
        ]);

        // Update local state
        setPourcentageCommandes(pourcentageData);
        setTauxReussite(tauxReussiteData);
        setTempsConversion(tempsConversionData);
        // Removed: setNombreConversions(nbConversionsData);

         // Update focused chart data if dialog is open
        if (isOpen && focusedChartInfo) {
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
                    // Update this chart using tempsConversionData
                    updateFocusedChartData('commerciaux-nb-conversions', tempsConversionData);
                    break;
                default:
                    break;
            }
        }

        setLoading(false);
      } catch (err) {
        // Log the specific error for debugging
        console.error('Erreur lors de la récupération des données dans Commerciaux.js:', err);
        setLoadingError(`Erreur lors de la récupération des données: ${err.message || 'Veuillez réessayer plus tard.'}`);
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedAnnee, selectedCommercial, isOpen, focusedChartInfo, updateFocusedChartData]);

  // Use useCallback for stability
  const handleFilterChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'annee') setSelectedAnnee(value);
    if (name === 'commercial') setSelectedCommercial(value);
  }, []); // Dependencies only setters

  // Calculer les KPIs (useMemo for derived values)
  const tauxReussiteMoyen = useMemo(() => tauxReussite.length === 0 ? 0 : (tauxReussite.reduce((acc, curr) => acc + parseFloat(curr.Taux_Reussite || 0), 0) / tauxReussite.length).toFixed(2), [tauxReussite]);
  const tempsConversionMoyen = useMemo(() => tempsConversion.length === 0 ? 0 : (tempsConversion.reduce((acc, curr) => acc + parseFloat(curr.Temps_Moyen_Conversion || 0), 0) / tempsConversion.length).toFixed(1), [tempsConversion]);
  // Calculate total conversions from tempsConversion data
  const nombreConversionsTotal = useMemo(() => tempsConversion.reduce((acc, curr) => acc + parseInt(curr.Nombre_Conversions || 0), 0), [tempsConversion]);
  const nombreCommerciauxFiltres = useMemo(() => new Set(pourcentageCommandes.map(c => c.Commercial)).size, [pourcentageCommandes]);

  // Filter Definition for Dialogs
  const commerciauxFilterDefinition = useMemo(() => ({
      config: [
          { id: 'annee', label: 'Année', options: annees, value: selectedAnnee },
          { id: 'commercial', label: 'Commercial', options: commerciaux.map(c => ({ value: c.id, label: c.nom })), value: selectedCommercial }
      ],
      onChange: handleFilterChange
  }), [annees, selectedAnnee, commerciaux, selectedCommercial, handleFilterChange]);

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
              disabled={loading}
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
              disabled={loading}
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

      {/* Graphiques (Wrapped in clickable Box) */}
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
                        filterDefinition: commerciauxFilterDefinition
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
                        filterDefinition: commerciauxFilterDefinition
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
                        filterDefinition: commerciauxFilterDefinition
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
                        filterDefinition: commerciauxFilterDefinition
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