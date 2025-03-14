import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import LineChart from '../components/charts/LineChart';
import { caService, commercialService, motifService, objectifService } from '../services/api';

// Icônes pour les KPIs
import { ReactComponent as ChartIcon } from '../assets/chart-icon.svg';
import { ReactComponent as UserIcon } from '../assets/user-icon.svg';
import { ReactComponent as TargetIcon } from '../assets/target-icon.svg';
import { ReactComponent as ReasonIcon } from '../assets/reason-icon.svg';

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
  
  if (loading) {
    return (
      <Layout title="Tableau de bord">
        <div className="loading">Chargement des données...</div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Tableau de bord">
        <div className="error">{error}</div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Tableau de bord">
      <div className="grid-container">
        <KpiCard 
          title="Chiffre d'affaires total" 
          value={caTotal.toLocaleString('fr-FR')} 
          unit="€" 
          icon={<ChartIcon />} 
          color="#3498db" 
        />
        
        <KpiCard 
          title="Nombre de commerciaux" 
          value={tauxReussiteCommerciaux.length} 
          icon={<UserIcon />} 
          color="#2ecc71" 
        />
        
        <KpiCard 
          title="Taux de réussite moyen" 
          value={tauxReussiteCommerciaux.length > 0 
            ? (tauxReussiteCommerciaux.reduce((acc, curr) => acc + curr.Taux_Reussite, 0) / tauxReussiteCommerciaux.length).toFixed(2) 
            : 0
          } 
          unit="%" 
          icon={<TargetIcon />} 
          color="#e74c3c" 
        />
        
        <KpiCard 
          title="Nombre de motifs" 
          value={motifs.length} 
          icon={<ReasonIcon />} 
          color="#f39c12" 
        />
      </div>
      
      <h2 className="section-title">Chiffre d'affaires par pays</h2>
      <BarChart 
        data={caParPays} 
        xKey="Pays" 
        yKey="CA" 
        title={`Chiffre d'affaires par pays (${anneeActuelle})`} 
      />
      
      <h2 className="section-title">Taux de réussite des commerciaux</h2>
      <BarChart 
        data={tauxReussiteCommerciaux} 
        xKey="Commercial" 
        yKey="Taux_Reussite" 
        title={`Taux de réussite des commerciaux (${anneeActuelle})`} 
        color="#2ecc71" 
      />
      
      <h2 className="section-title">Répartition des motifs de commande</h2>
      <PieChart 
        data={motifs} 
        nameKey="Motif_Commande" 
        valueKey="Pourcentage" 
        title={`Répartition des motifs de commande (${anneeActuelle})`} 
      />
      
      <h2 className="section-title">Taux de complétion des objectifs</h2>
      <BarChart 
        data={tauxCompletionObjectifs} 
        xKey="Groupe_Vendeur" 
        yKey="Taux_Completion" 
        title={`Taux de complétion des objectifs (${anneeActuelle})`} 
        color="#e74c3c" 
      />
    </Layout>
  );
};

export default Dashboard; 