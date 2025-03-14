import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import KpiCard from '../components/KpiCard';
import { caService } from '../services/api';

// Icônes pour les KPIs
import { ReactComponent as ChartIcon } from '../assets/chart-icon.svg';

const ChiffreAffaires = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [annees, setAnnees] = useState([]);
  const [pays, setPays] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState(new Date().getFullYear());
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
        const yearsData = await caService.getAvailableYears();
        const countriesData = await caService.getAvailableCountries();
        
        setAnnees(yearsData.map(item => item.Annee));
        setPays(countriesData.map(item => item.Pays));
        
        // Définir l'année la plus récente comme valeur par défaut
        if (yearsData.length > 0) {
          const latestYear = Math.max(...yearsData.map(item => item.Annee));
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
        
        // Récupérer le CA total pour l'année sélectionnée
        const caTotalData = await caService.getCATotalByAnnee(selectedAnnee);
        setCATotal(caTotalData[0]?.CA_Total || 0);
        
        // Récupérer le CA par pays pour l'année sélectionnée
        const filters = { annee: selectedAnnee };
        if (selectedPays) {
          filters.pays = selectedPays;
        }
        const caParPaysData = await caService.getCAByPaysAnnee(filters);
        setCAParPays(caParPaysData);
        
        // Récupérer le CA par vendeur pour l'année sélectionnée
        const caParVendeurData = await caService.getCAByVendeurAnnee({ annee: selectedAnnee });
        setCAParVendeur(caParVendeurData);
        
        // Récupérer le CA par année pour tous les pays
        const allYearsData = [];
        for (const year of annees) {
          const yearData = await caService.getCATotalByAnnee(year);
          if (yearData[0]) {
            allYearsData.push({
              Annee: year,
              CA: yearData[0].CA_Total
            });
          }
        }
        setCAParAnnee(allYearsData);
        
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
  }, [selectedAnnee, selectedPays, annees]);
  
  const handleAnneeChange = (e) => {
    setSelectedAnnee(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
  };
  
  const handlePaysChange = (e) => {
    setSelectedPays(e.target.value);
  };
  
  if (loading && annees.length === 0) {
    return (
      <Layout title="Chiffre d'affaires">
        <div className="loading">Chargement des données...</div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Chiffre d'affaires">
        <div className="error">{error}</div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Chiffre d'affaires">
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
          <label htmlFor="pays">Pays:</label>
          <select id="pays" value={selectedPays} onChange={handlePaysChange}>
            <option value="">Tous les pays</option>
            {pays.map(pays => (
              <option key={pays} value={pays}>{pays}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid-container">
        <KpiCard 
          title="Chiffre d'affaires total" 
          value={caTotal.toLocaleString('fr-FR')} 
          unit="€" 
          icon={<ChartIcon />} 
          color="#3498db" 
        />
        
        <KpiCard 
          title="Nombre de pays" 
          value={caParPays.length} 
          icon={<ChartIcon />} 
          color="#2ecc71" 
        />
        
        <KpiCard 
          title="Nombre de groupes de vendeurs" 
          value={caParVendeur.length} 
          icon={<ChartIcon />} 
          color="#e74c3c" 
        />
      </div>
      
      <h2 className="section-title">Chiffre d'affaires par pays</h2>
      <BarChart 
        data={caParPays} 
        xKey="Pays" 
        yKey="CA" 
        title={`Chiffre d'affaires par pays (${selectedAnnee === 'all' ? 'Toutes les années' : selectedAnnee})`} 
      />
      
      <h2 className="section-title">Chiffre d'affaires par groupe de vendeurs</h2>
      <BarChart 
        data={caParVendeur} 
        xKey="Groupe_Vendeur" 
        yKey="CA" 
        title={`Chiffre d'affaires par groupe de vendeurs (${selectedAnnee === 'all' ? 'Toutes les années' : selectedAnnee})`} 
        color="#2ecc71" 
      />
      
      <h2 className="section-title">Évolution du chiffre d'affaires par année</h2>
      <LineChart 
        data={caParAnnee} 
        xKey="Annee" 
        yKey="CA" 
        title="Évolution du chiffre d'affaires par année" 
        color="#e74c3c" 
      />
    </Layout>
  );
};

export default ChiffreAffaires; 