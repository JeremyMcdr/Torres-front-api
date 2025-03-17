import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/charts/BarChart';
import KpiCard from '../components/KpiCard';
import { commercialService } from '../services/api';

// Icônes pour les KPIs
import { ReactComponent as UserIcon } from '../assets/user-icon.svg';
import { ReactComponent as TimeIcon } from '../assets/user-icon.svg'; // Utiliser la même icône en attendant

const Commerciaux = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [annees, setAnnees] = useState([]);
  const [commerciaux, setCommerciaux] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState(new Date().getFullYear());
  const [selectedCommercial, setSelectedCommercial] = useState('');
  
  // États pour les données
  const [pourcentageCommandes, setPourcentageCommandes] = useState([]);
  const [tauxReussite, setTauxReussite] = useState([]);
  const [tempsConversion, setTempsConversion] = useState([]);
  
  // Récupérer les années et commerciaux disponibles
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Pour simplifier, nous utilisons les données des commerciaux pour obtenir les années disponibles
        const commerciauxData = await commercialService.getAvailableCommerciaux();
        setCommerciaux(commerciauxData.map(item => ({
          id: item.Commercial,
          nom: item.Nom_Commercial || `Commercial ${item.Commercial}`
        })));
        
        // Récupérer les données pour obtenir les années disponibles
        const tauxReussiteData = await commercialService.getTauxReussiteCommercial({});
        const years = [...new Set(tauxReussiteData.map(item => item.Annee))];
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
        
        // Récupérer le pourcentage de commandes par commercial
        const filters = { annee: selectedAnnee };
        if (selectedCommercial) {
          filters.commercial = selectedCommercial;
        }
        const pourcentageCommandesData = await commercialService.getPourcentageCommandesCommercial(filters);
        setPourcentageCommandes(pourcentageCommandesData);
        
        // Récupérer le taux de réussite des commerciaux
        const tauxReussiteData = await commercialService.getTauxReussiteCommercial(filters);
        setTauxReussite(tauxReussiteData);
        
        // Récupérer les temps de conversion des commerciaux
        const tempsConversionData = await commercialService.getTempsConversion(filters);
        setTempsConversion(tempsConversionData);
        
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
  }, [selectedAnnee, selectedCommercial, annees]);
  
  const handleAnneeChange = (e) => {
    setSelectedAnnee(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
  };
  
  const handleCommercialChange = (e) => {
    setSelectedCommercial(e.target.value);
  };
  
  // Calculer les KPIs
  const getTauxReussiteMoyen = () => {
    if (tauxReussite.length === 0) return 0;
    return (tauxReussite.reduce((acc, curr) => acc + curr.Taux_Reussite, 0) / tauxReussite.length).toFixed(2);
  };
  
  const getNombreOffresTotal = () => {
    if (pourcentageCommandes.length === 0) return 0;
    return pourcentageCommandes.reduce((acc, curr) => acc + curr.Nombre_Offres, 0);
  };
  
  const getNombreCommandesTotal = () => {
    if (pourcentageCommandes.length === 0) return 0;
    return pourcentageCommandes.reduce((acc, curr) => acc + curr.Nombre_Commandes, 0);
  };
  
  const getTempsConversionMoyen = () => {
    if (tempsConversion.length === 0) return 0;
    return (tempsConversion.reduce((acc, curr) => acc + curr.Temps_Moyen_Conversion, 0) / tempsConversion.length).toFixed(1);
  };
  
  const getNombreConversionsTotal = () => {
    if (tempsConversion.length === 0) return 0;
    return tempsConversion.reduce((acc, curr) => acc + curr.Nombre_Conversions, 0);
  };
  
  if (loading && annees.length === 0) {
    return (
      <Layout title="Commerciaux">
        <div className="loading">Chargement des données...</div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Commerciaux">
        <div className="error">{error}</div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Commerciaux">
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
          <label htmlFor="commercial">Commercial:</label>
          <select id="commercial" value={selectedCommercial} onChange={handleCommercialChange}>
            <option value="">Tous les commerciaux</option>
            {commerciaux.map(commercial => (
              <option key={commercial.id} value={commercial.id}>{commercial.nom}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid-container">
        <KpiCard 
          title="Nombre de commerciaux" 
          value={pourcentageCommandes.length} 
          icon={<UserIcon />} 
          color="#3498db" 
        />
        
        <KpiCard 
          title="Taux de réussite moyen" 
          value={getTauxReussiteMoyen()} 
          unit="%" 
          icon={<UserIcon />} 
          color="#2ecc71" 
        />
        
        <KpiCard 
          title="Temps de conversion moyen" 
          value={getTempsConversionMoyen()} 
          unit="jours" 
          icon={<TimeIcon />} 
          color="#9b59b6" 
        />
        
        <KpiCard 
          title="Nombre de conversions total" 
          value={getNombreConversionsTotal()} 
          icon={<UserIcon />} 
          color="#f39c12" 
        />
      </div>
      
      <h2 className="section-title">Pourcentage de commandes par commercial</h2>
      <BarChart 
        data={pourcentageCommandes} 
        xKey="Nom_Commercial" 
        yKey="Pourcentage_Commandes" 
        title={`Pourcentage de commandes par commercial (${selectedAnnee === 'all' ? 'Toutes les années' : selectedAnnee})`} 
      />
      
      <h2 className="section-title">Taux de réussite par commercial</h2>
      <BarChart 
        data={tauxReussite} 
        xKey="Nom_Commercial" 
        yKey="Taux_Reussite" 
        title={`Taux de réussite par commercial (${selectedAnnee === 'all' ? 'Toutes les années' : selectedAnnee})`} 
        color="#2ecc71" 
      />
      
      <h2 className="section-title">Temps moyen de conversion par commercial</h2>
      <BarChart 
        data={tempsConversion} 
        xKey="Nom_Commercial" 
        yKey="Temps_Moyen_Conversion" 
        title={`Temps moyen de conversion par commercial (jours)`} 
        color="#9b59b6" 
      />
      
      <h2 className="section-title">Nombre de conversions par commercial</h2>
      <BarChart 
        data={tempsConversion} 
        xKey="Nom_Commercial" 
        yKey="Nombre_Conversions" 
        title={`Nombre de conversions par commercial`} 
        color="#f39c12" 
      />
    </Layout>
  );
};

export default Commerciaux; 