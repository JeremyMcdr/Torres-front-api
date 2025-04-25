import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import KpiCard from '../components/KpiCard';
import { caService } from '../services/api';
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

  const { openFocusDialog, isOpen, focusedChartInfo, updateFocusedChartData } = useFocusChart();

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

  // --- Component to render filters (used on page and potentially in dialog) ---
  const renderFilters = useCallback((isDialog = false) => (
      <Stack direction={isDialog ? 'row' : { xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl sx={{ minWidth: isDialog ? 150 : 200 }} size={isDialog ? "small" : "medium"}>
          <InputLabel id="annee-label">Année</InputLabel>
          <Select
            labelId="annee-label"
            value={selectedAnnee}
            label="Année"
            name="annee"
            onChange={(event) => {
              setSelectedAnnee(event.target.value);
            }}
            disabled={annees.length === 0}
          >
            <MenuItem value="all"><em>Toutes</em></MenuItem>
            {annees.map(annee => (
              <MenuItem key={annee} value={annee}>{annee}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: isDialog ? 150 : 200 }} size={isDialog ? "small" : "medium"}>
          <InputLabel id="pays-label">Pays</InputLabel>
          <Select
            labelId="pays-label"
            value={selectedPays}
            label="Pays"
            name="pays"
            onChange={(event) => {
              setSelectedPays(event.target.value);
            }}
          >
            <MenuItem value=""><em>Tous</em></MenuItem>
            {pays.map(p => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
  ), [selectedAnnee, selectedPays, annees, pays]);

  // --- Filter Change Handler ---
  const handleFilterChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'annee') setSelectedAnnee(value);
    if (name === 'pays') setSelectedPays(value);
  }, []); // Now stable

  // --- Fetch Data (Modified useEffect) ---
  useEffect(() => {
    if (!selectedAnnee) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingError(null);
        const filters = { 
            annee: selectedAnnee !== 'all' ? selectedAnnee : undefined,
            pays: selectedPays || undefined 
        };
        // Fetch all data based on current filters
        const [caTotalData, caParPaysData, caParVendeurData, allYearsDataRes] = await Promise.all([
          caService.getCATotalByAnnee(selectedAnnee !== 'all' ? selectedAnnee : new Date().getFullYear()),
          caService.getCAByPaysAnnee({ annee: filters.annee, pays: filters.pays }),
          caService.getCAByVendeurAnnee({ annee: filters.annee }),
          Promise.all(annees.filter(year => !isNaN(parseInt(year))).map(year => caService.getCATotalByAnnee(year))) // Filter out 'all' if present for this call
        ]);

        // Process and set state
        const validYears = annees.filter(year => !isNaN(parseInt(year))); // Use only valid years for mapping
        const newCaParAnnee = allYearsDataRes
          .map((res, index) => ({
             Annee: validYears[index],
             CA: res[0]?.CA_Total || 0
           }))
          .sort((a, b) => a.Annee - b.Annee);

        // Update local state first
        setCATotal(caTotalData[0]?.CA_Total || 0);
        setCAParPays(caParPaysData);
        setCAParVendeur(caParVendeurData);
        setCAParAnnee(newCaParAnnee);

        // Update focused chart data if dialog is open
        if (isOpen && focusedChartInfo) {
            console.log("Checking if focused chart needs update. ID:", focusedChartInfo.id);
            if (focusedChartInfo.id === 'ca-par-pays') {
                updateFocusedChartData('ca-par-pays', caParPaysData); // Pass the NEW data array
            }
            if (focusedChartInfo.id === 'ca-par-vendeur') {
                updateFocusedChartData('ca-par-vendeur', caParVendeurData);
            }
            if (focusedChartInfo.id === 'ca-evolution') {
                updateFocusedChartData('ca-evolution', newCaParAnnee);
            }
        }

        setLoading(false);
      } catch (err) {
        console.error('Erreur données:', err);
        setLoadingError('Erreur récupération données.');
        setLoading(false);
      }
    };

    // Only fetch if annees array is populated to avoid issues with initial empty state
    if(annees.length > 0) {
        fetchData();
    }

  // Dependencies now correctly include the context update function and related states
  }, [selectedAnnee, selectedPays, annees, isOpen, focusedChartInfo, updateFocusedChartData]);

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
         {renderFilters()}
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
          {(() => { 
            const chartTitle = `CA par pays (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee}${selectedPays ? ` / ${selectedPays}` : ''})`;
            const chartProps = { xKey: "Pays", yKey: "CA", title: chartTitle, color: "#3498db" }; 
            const filterDefinition = {
                config: [
                  { id: 'annee', label: 'Année', options: annees, value: selectedAnnee }, 
                  { id: 'pays', label: 'Pays', options: pays, value: selectedPays }
                ],
                onChange: handleFilterChange
            };
            return (
              <Box 
                  onClick={() => openFocusDialog({
                    id: 'ca-par-pays',
                    type: 'bar', 
                    title: chartTitle, 
                    chartProps, 
                    chartData: caParPays,
                    filterDefinition 
                  })} 
                  sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
              >
                  <BarChart data={caParPays} {...chartProps} />
              </Box>
            );
          })()}
        </Grid>
        <Grid item xs={12} md={6}>
          {(() => { 
            const chartTitle = `CA par groupe de vendeurs (${selectedAnnee === 'all' ? 'Toutes' : selectedAnnee})`;
            const chartProps = { xKey: "Groupe_Vendeur", yKey: "CA", title: chartTitle, color: "#2ecc71" };
            const filterDefinition = {
                config: [
                  { id: 'annee', label: 'Année', options: annees, value: selectedAnnee }
                ],
                onChange: handleFilterChange
            };
            return (
                <Box 
                  onClick={() => openFocusDialog({
                    id: 'ca-par-vendeur',
                    type: 'bar', 
                    title: chartTitle, 
                    chartProps, 
                    chartData: caParVendeur,
                    filterDefinition
                  })} 
                  sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                >
                    <BarChart data={caParVendeur} {...chartProps} />
                </Box>
            );
          })()}
        </Grid>
        <Grid item xs={12}>
          {(() => {
            const chartTitle = "Évolution du CA par année";
            const chartProps = { xKey: "Annee", yKey: "CA", title: chartTitle, color: "#e74c3c" };
            const filterDefinition = null;
            return (
                <Box 
                  onClick={() => openFocusDialog({
                    id: 'ca-evolution',
                    type: 'line', 
                    title: chartTitle, 
                    chartProps, 
                    chartData: caParAnnee,
                    filterDefinition
                  })} 
                  sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.1s ease-in-out' } }}
                >
                    <LineChart data={caParAnnee} {...chartProps} />
                </Box>
            );
          })()}
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ChiffreAffaires; 