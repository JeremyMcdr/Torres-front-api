import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import KpiCard from '../components/KpiCard';
import { motifService } from '../services/api';

// Icônes pour les KPIs
import { ReactComponent as ReasonIcon } from '../assets/reason-icon.svg';

const Motifs = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [annees, setAnnees] = useState([]);
  const [motifs, setMotifs] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState(new Date().getFullYear());
  const [selectedMotif, setSelectedMotif] = useState('');
  
  // États pour les données
  const [pourcentageMotifs, setPourcentageMotifs] = useState([]);
  
  // Récupérer les années et motifs disponibles
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Récupérer les motifs
        const motifsData = await motifService.getAvailableMotifs();
        setMotifs(motifsData.map(item => item.Motif_Commande));
        
        // Récupérer les données pour obtenir les années disponibles
        const pourcentageData = await motifService.getPourcentageMotifsByAnnee({});
        const years = [...new Set(pourcentageData.map(item => item.Annee))];
        setAnnees(years);
        
        // Définir l'année la plus récente comme valeur par défaut
        if (years.length > 0) {
          const latestYear = Math.max(...years);
          setSelectedAnnee(latestYear);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des filtres:', err);
        setError('Erreur lors de la récupération des filtres. Veuillez réessayer plus tard.');
      }
    };
    
    fetchFilters();
  }, []);
  
  // Récupérer les données en fonction des filtres
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer le pourcentage de motifs par année
        const filters = { annee: selectedAnnee };
        if (selectedMotif) {
          filters.motif = selectedMotif;
        }
        const pourcentageData = await motifService.getPourcentageMotifsByAnnee(filters);
        setPourcentageMotifs(pourcentageData);
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Erreur lors de la récupération des données. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };
    
    if (annees.length > 0) {
      fetchData();
    }
  }, [selectedAnnee, selectedMotif, annees]);
  
  const handleAnneeChange = (e) => {
    setSelectedAnnee(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
  };
  
  const handleMotifChange = (e) => {
    setSelectedMotif(e.target.value);
  };
  
  // Calculer les KPIs
  const getNombreMotifs = () => {
    return pourcentageMotifs.length;
  };
  
  const getMotifPrincipal = () => {
    if (pourcentageMotifs.length === 0) return 'Aucun';
    const motifPrincipal = [...pourcentageMotifs].sort((a, b) => b.Pourcentage - a.Pourcentage)[0];
    return motifPrincipal.Motif_Commande;
  };
  
  const getPourcentageMotifPrincipal = () => {
    if (pourcentageMotifs.length === 0) return 0;
    const motifPrincipal = [...pourcentageMotifs].sort((a, b) => b.Pourcentage - a.Pourcentage)[0];
    return motifPrincipal.Pourcentage.toFixed(2);
  };
  
  if (loading && annees.length === 0) {
    return (
      <Layout title="Motifs de commande">
        <div className="loading">Chargement des données...</div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Motifs de commande">
        <div className="error">{error}</div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Motifs de commande">
      <div className="filter-container">
        <div className="filter-item">
          <label htmlFor="annee">Année:</label>
          <select id="annee" value={selectedAnnee} onChange={handleAnneeChange}>
            <option value="all">Toutes les années</option>
            {annees.map(annee => (
              <option key={annee} value={annee}>{annee}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-item">
          <label htmlFor="motif">Motif:</label>
          <select id="motif" value={selectedMotif} onChange={handleMotifChange}>
            <option value="">Tous les motifs</option>
            {motifs.map(motif => (
              <option key={motif} value={motif}>{motif}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid-container">
        <KpiCard 
          title="Nombre de motifs" 
          value={getNombreMotifs()} 
          icon={<ReasonIcon />} 
          color="#3498db" 
        />
        
        <KpiCard 
          title="Motif principal" 
          value={getMotifPrincipal()} 
          icon={<ReasonIcon />} 
          color="#2ecc71" 
        />
        
        <KpiCard 
          title="Pourcentage du motif principal" 
          value={getPourcentageMotifPrincipal()} 
          unit="%" 
          icon={<ReasonIcon />} 
          color="#e74c3c" 
        />
      </div>
      
      <h2 className="section-title">Répartition des motifs de commande</h2>
      <PieChart 
        data={pourcentageMotifs} 
        nameKey="Motif_Commande" 
        valueKey="Pourcentage" 
        title={`Répartition des motifs de commande (${selectedAnnee === 'all' ? 'Toutes les années' : selectedAnnee})`} 
      />
      
      <h2 className="section-title">Pourcentage par motif de commande</h2>
      <BarChart 
        data={pourcentageMotifs} 
        xKey="Motif_Commande" 
        yKey="Pourcentage" 
        title={`Pourcentage par motif de commande (${selectedAnnee === 'all' ? 'Toutes les années' : selectedAnnee})`} 
        color="#2ecc71" 
      />
    </Layout>
  );
};

export default Motifs; 