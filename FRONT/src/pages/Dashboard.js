import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
// import LineChart from '../components/charts/LineChart'; // Pas utilisé sur le dashboard actuel
import { caService, commercialService, motifService, objectifService } from '../services/api';

// Importer les composants MUI
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

// Importer les icônes MUI
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; // Pour CA Total
import PeopleIcon from '@mui/icons-material/People'; // Pour Nombre de commerciaux
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Pour Taux de réussite
import AssignmentIcon from '@mui/icons-material/Assignment'; // Pour Motifs

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anneeActuelle] = useState(new Date().getFullYear());
  
  // États pour les données
  const [caTotal, setCATotal] = useState(0);
  const [caParPays, setCAParPays] = useState([]);
  const [tauxReussiteCommerciaux, setTauxReussiteCommerciaux] = useState([]);
  const [motifs, setMotifs] = useState([]);
  const [tauxCompletionObjectifs, setTauxCompletionObjectifs] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch
        
        // Récupérer le CA total pour l'année actuelle
        const caTotalData = await caService.getCATotalByAnnee(anneeActuelle);
        setCATotal(caTotalData[0]?.CA_Total || 0);
        
        // Récupérer le CA par pays pour l'année actuelle
        const caParPaysData = await caService.getCAByPaysAnnee({ annee: anneeActuelle });
        setCAParPays(caParPaysData);
        
        // Récupérer le taux de réussite des commerciaux pour l'année actuelle
        const tauxReussiteData = await commercialService.getTauxReussiteCommercial({ annee: anneeActuelle });
        setTauxReussiteCommerciaux(tauxReussiteData);
        
        // Récupérer les motifs de commande pour l'année actuelle
        const motifsData = await motifService.getPourcentageMotifsByAnnee({ annee: anneeActuelle });
        setMotifs(motifsData);
        
        // Récupérer le taux de complétion des objectifs pour l'année actuelle
        const tauxCompletionData = await objectifService.getTauxCompletionObjectifs({ annee: anneeActuelle });
        setTauxCompletionObjectifs(tauxCompletionData);
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Erreur lors de la récupération des données. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [anneeActuelle]);
  
  // Affichage Chargement
  if (loading) {
    return (
      <Layout title="Tableau de bord">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  // Affichage Erreur
  if (error) {
    return (
      <Layout title="Tableau de bord">
        <Alert severity="error" sx={{ margin: 2 }}>{error}</Alert>
      </Layout>
    );
  }
  
  // Calcul du taux de réussite moyen
  const tauxReussiteMoyen = tauxReussiteCommerciaux.length > 0
    ? (tauxReussiteCommerciaux.reduce((acc, curr) => acc + parseFloat(curr.Taux_Reussite || 0), 0) / tauxReussiteCommerciaux.length).toFixed(2)
    : 0;
  
  return (
    <Layout title="Tableau de bord">
      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 3 }}> {/* Conteneur Grid pour les KPIs */}
        <Grid item xs={12} sm={6} md={3}> {/* Item Grid pour chaque KPI */}
          <KpiCard 
            title="Chiffre d'affaires total" 
            value={caTotal.toLocaleString('fr-FR')} 
            unit="€" 
            icon={<MonetizationOnIcon fontSize="large" />} 
            color="#3498db" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Nombre de commerciaux" 
            value={tauxReussiteCommerciaux.length} 
            icon={<PeopleIcon fontSize="large" />} 
            color="#2ecc71" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Taux de réussite moyen" 
            value={tauxReussiteMoyen} 
            unit="%" 
            icon={<TrendingUpIcon fontSize="large" />} 
            color="#e74c3c" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Nombre de motifs" 
            value={motifs.length} 
            icon={<AssignmentIcon fontSize="large" />} 
            color="#f39c12" 
          />
        </Grid>
      </Grid>
      
      {/* Graphiques */}
      <Grid container spacing={3}> {/* Conteneur Grid pour les graphiques */}
        <Grid item xs={12} md={6}> {/* CA par Pays */}
          <BarChart 
            data={caParPays} 
            xKey="Pays" 
            yKey="CA" 
            title={`Chiffre d'affaires par pays (${anneeActuelle})`} 
            color="#3498db" 
          />
        </Grid>
        <Grid item xs={12} md={6}> {/* Taux de réussite */}
          <BarChart 
            data={tauxReussiteCommerciaux} 
            xKey="Commercial" 
            yKey="Taux_Reussite" 
            title={`Taux de réussite des commerciaux (${anneeActuelle})`} 
            color="#2ecc71" 
          />
        </Grid>
        <Grid item xs={12} md={6}> {/* Motifs */}
          <PieChart 
            data={motifs} 
            nameKey="Motif_Commande" 
            valueKey="Pourcentage" 
            title={`Répartition des motifs de commande (${anneeActuelle})`} 
          />
        </Grid>
        <Grid item xs={12} md={6}> {/* Taux de complétion */}
          <BarChart 
            data={tauxCompletionObjectifs} 
            xKey="Groupe_Vendeur" 
            yKey="Taux_Completion" 
            title={`Taux de complétion des objectifs (${anneeActuelle})`} 
            color="#e74c3c" 
          />
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard; 