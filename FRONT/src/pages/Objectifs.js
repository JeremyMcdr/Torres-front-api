import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import GaugeChart from '../components/charts/GaugeChart';
import ComparisonChart from '../components/charts/ComparisonChart';
import KpiCard from '../components/KpiCard';
import { objectifService, commercialService } from '../services/api';
import './Objectifs.css';

// Icônes pour les KPIs
import { ReactComponent as TargetIcon } from '../assets/target-icon.svg';
import { ReactComponent as ChartIcon } from '../assets/chart-icon.svg';
import { ReactComponent as PercentIcon } from '../assets/percent-icon.svg';
import { ReactComponent as ProjectionIcon } from '../assets/projection-icon.svg';

const Objectifs = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [annees, setAnnees] = useState([]);
  const [groupesVendeurs, setGroupesVendeurs] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState(new Date().getFullYear());
  const [selectedGroupeVendeur, setSelectedGroupeVendeur] = useState('');
  
  // États pour les données
  const [objectifs, setObjectifs] = useState([]);
  const [tauxCompletion, setTauxCompletion] = useState([]);
  const [projectionCA, setProjectionCA] = useState(null);
  const [evolutionData, setEvolutionData] = useState([]);
  
  // Récupérer les années et groupes de vendeurs disponibles
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Récupérer les groupes de vendeurs
        const groupesVendeursData = await commercialService.getAvailableGroupesVendeurs();
        // Stocker les données complètes des groupes de vendeurs, pas juste les identifiants
        setGroupesVendeurs(groupesVendeursData);
        
        // Récupérer les objectifs pour obtenir les années disponibles
        const objectifsData = await objectifService.getObjectifsCommerciaux({});
        const years = [...new Set(objectifsData.map(item => item.Annee))];
        setAnnees(years);
        
        // Définir l'année la plus récente comme valeur par défaut
        if (years.length > 0) {
          const latestYear = Math.max(...years);
          setSelectedAnnee(latestYear);
        }
        
        // Définir le premier groupe de vendeur comme valeur par défaut
        if (groupesVendeursData.length > 0) {
          setSelectedGroupeVendeur(groupesVendeursData[0].Groupe_Vendeur);
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
        
        // Récupérer les objectifs commerciaux
        const filters = { annee: selectedAnnee };
        if (selectedGroupeVendeur) {
          filters.groupe_vendeur = selectedGroupeVendeur;
        }
        const objectifsData = await objectifService.getObjectifsCommerciaux(filters);
        setObjectifs(objectifsData);
        
        // Récupérer le taux de complétion des objectifs
        const tauxCompletionData = await objectifService.getTauxCompletionObjectifs(filters);
        setTauxCompletion(tauxCompletionData);
        
        // Récupérer la projection du CA pour l'année en cours
        if (selectedGroupeVendeur && selectedAnnee === new Date().getFullYear()) {
          const projectionData = await objectifService.getProjectionCA(selectedGroupeVendeur, selectedAnnee);
          setProjectionCA(projectionData[0]);
        } else {
          setProjectionCA(null);
        }
        
        // Récupérer l'évolution des objectifs et du CA
        const evolutionData = await objectifService.getEvolutionObjectifsCA(selectedGroupeVendeur);
        setEvolutionData(evolutionData);
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Erreur lors de la récupération des données. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };
    
    if (annees.length > 0 && groupesVendeurs.length > 0) {
      fetchData();
    }
  }, [selectedAnnee, selectedGroupeVendeur, annees, groupesVendeurs]);
  
  const handleAnneeChange = (e) => {
    setSelectedAnnee(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
  };
  
  const handleGroupeVendeurChange = (e) => {
    setSelectedGroupeVendeur(e.target.value);
  };
  
  // Calculer les KPIs
  const getObjectifTotal = () => {
    if (objectifs.length === 0) return 0;
    return objectifs.reduce((acc, curr) => acc + curr.Objectif_Commercial, 0);
  };
  
  const getCATotal = () => {
    if (objectifs.length === 0) return 0;
    return objectifs.reduce((acc, curr) => acc + curr.CA, 0);
  };
  
  const getTauxCompletionMoyen = () => {
    if (tauxCompletion.length === 0) return 0;
    return (tauxCompletion.reduce((acc, curr) => acc + curr.Taux_Completion, 0) / tauxCompletion.length).toFixed(2);
  };
  
  // Préparer les données pour les graphiques comparatifs
  const prepareComparisonData = () => {
    return objectifs.map(item => ({
      Groupe_Vendeur: item.Groupe_Vendeur,
      Objectif: item.Objectif_Commercial,
      Realisation: item.CA
    }));
  };
  
  // Préparer les données pour le graphique d'évolution
  const prepareEvolutionData = () => {
    if (selectedGroupeVendeur) {
      // Pour un groupe de vendeur spécifique
      return evolutionData.map(item => ({
        Annee: item.Annee.toString(),
        Objectif: item.Objectif_Commercial,
        CA: item.CA,
        commercial: item.Nom_Commercial || `Commercial ${item.Groupe_Vendeur}`
      }));
    } else {
      // Pour tous les groupes de vendeurs
      return evolutionData.map(item => ({
        Annee: item.Annee.toString(),
        Objectif: item.Objectif_Total,
        CA: item.CA_Total
      }));
    }
  };
  
  // Calculer le taux de complétion global
  const getTauxCompletionGlobal = () => {
    const objectifTotal = getObjectifTotal();
    const caTotal = getCATotal();
    return objectifTotal !== 0 ? (caTotal / objectifTotal) * 100 : 0;
  };
  
  // Trouver le meilleur et le pire groupe de vendeurs
  const getBestWorstGroups = () => {
    if (tauxCompletion.length === 0) return { best: null, worst: null };
    
    const sorted = [...tauxCompletion].sort((a, b) => b.Taux_Completion - a.Taux_Completion);
    return {
      best: sorted[0],
      worst: sorted[sorted.length - 1]
    };
  };
  
  // Calculer la tendance d'évolution
  const calculateEvolutionTrend = () => {
    if (evolutionData.length < 2) return null;
    
    const lastTwoYears = evolutionData.slice(-2);
    const previousYear = lastTwoYears[0];
    const currentYear = lastTwoYears[1];
    
    // Calculer le taux de complétion pour les deux dernières années
    const previousTaux = previousYear.CA / previousYear.Objectif_Commercial * 100;
    const currentTaux = currentYear.CA / currentYear.Objectif_Commercial * 100;
    
    // Calculer la variation en pourcentage
    const variation = currentTaux - previousTaux;
    
    return {
      value: variation.toFixed(2),
      isPositive: variation > 0,
      previousYear: previousYear.Annee,
      currentYear: currentYear.Annee
    };
  };
  
  const { best, worst } = getBestWorstGroups();
  const evolutionTrend = calculateEvolutionTrend();
  
  if (loading && annees.length === 0) {
    return (
      <Layout title="Objectifs">
        <div className="loading">Chargement des données...</div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Objectifs">
        <div className="error">{error}</div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Objectifs">
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
          <label htmlFor="groupe-vendeur">Groupe de vendeurs:</label>
          <select id="groupe-vendeur" value={selectedGroupeVendeur} onChange={handleGroupeVendeurChange}>
            <option value="">Tous les groupes</option>
            {groupesVendeurs.map(groupe => (
              <option key={groupe.Groupe_Vendeur} value={groupe.Groupe_Vendeur}>
                {groupe.Nom_Commercial || `Commercial ${groupe.Groupe_Vendeur}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid-container">
        <KpiCard 
          title="Objectif commercial total" 
          value={getObjectifTotal().toLocaleString('fr-FR')} 
          unit="€" 
          icon={<TargetIcon />} 
          color="#3498db" 
        />
        
        <KpiCard 
          title="CA total" 
          value={getCATotal().toLocaleString('fr-FR')} 
          unit="€" 
          icon={<ChartIcon />} 
          color="#2ecc71" 
        />
        
        <KpiCard 
          title="Taux de complétion moyen" 
          value={getTauxCompletionMoyen()} 
          unit="%" 
          icon={<PercentIcon />} 
          color="#e74c3c" 
          trend={evolutionTrend ? parseFloat(evolutionTrend.value) : null}
        />
        
        {/* KPI - Projection CA */}
        <div className="kpi">
          <div className="kpi-icon">
            <ProjectionIcon />
          </div>
          <div className="kpi-content">
            <h3>Projection CA {selectedAnnee}</h3>
            <div className="kpi-value">
              {projectionCA ? 
                <div className="kpi-value-container">
                  <div className="kpi-value-text">
                    {projectionCA.Projection_CA ? projectionCA.Projection_CA.toLocaleString('fr-FR') : 'N/A'} €
                  </div>
                  <div className="kpi-subvalue">
                    {projectionCA.Objectif_Commercial ? `Objectif: ${projectionCA.Objectif_Commercial.toLocaleString('fr-FR')} €` : 'Pas d\'objectif'}
                  </div>
                </div> 
                : 'Données non disponibles'
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Graphique d'évolution des objectifs et du CA */}
      <h2 className="section-title">Évolution des objectifs et du CA</h2>
      <LineChart 
        data={prepareEvolutionData()} 
        xKey="Annee" 
        yKey="CA" 
        title={`Évolution des objectifs et du CA ${selectedGroupeVendeur ? 
          `pour ${evolutionData.length > 0 ? evolutionData[0].Nom_Commercial || `Commercial ${selectedGroupeVendeur}` : selectedGroupeVendeur}` 
          : 'pour tous les commerciaux'}`} 
        color="#2ecc71"
        secondaryData={prepareEvolutionData()}
        secondaryKey="Objectif"
        secondaryColor="#3498db"
      />
      
      {/* Jauge de taux de complétion global */}
      <div className="grid-container">
        <div className="grid-item full-width">
          <GaugeChart 
            value={getTauxCompletionGlobal()} 
            title={`Taux de complétion global des objectifs (${selectedAnnee === 'all' ? 'Toutes les années' : selectedAnnee})`} 
          />
        </div>
      </div>
      
      {/* Graphique comparatif Objectifs vs Réalisations */}
      <h2 className="section-title">Comparaison Objectifs vs Réalisations</h2>
      <ComparisonChart 
        data={prepareComparisonData()} 
        xKey="Groupe_Vendeur" 
        yKey1="Objectif" 
        yKey2="Realisation" 
        title={`Objectifs vs Réalisations par groupe de vendeurs (${selectedAnnee === 'all' ? 'Toutes les années' : selectedAnnee})`} 
        label1="Objectif commercial" 
        label2="CA réalisé" 
      />
      
      {/* Taux de complétion des objectifs */}
      <h2 className="section-title">Taux de complétion des objectifs</h2>
      <BarChart 
        data={tauxCompletion} 
        xKey="Groupe_Vendeur" 
        yKey="Taux_Completion" 
        title={`Taux de complétion des objectifs (${selectedAnnee === 'all' ? 'Toutes les années' : selectedAnnee})`} 
        color="#e74c3c" 
      />
      
      {/* Meilleur et pire groupe de vendeurs */}
      {best && worst && (
        <div className="grid-container">
          <div className="grid-item">
            <div className="chart-container">
              <h3 className="chart-title">Meilleure performance</h3>
              <div className="best-worst-container">
                <div className="best-group">
                  <div className="group-name">{best.Nom_Commercial || `Commercial ${best.Groupe_Vendeur}`}</div>
                  <div className="group-stats">
                    <div className="stat-item">
                      <div className="stat-label">Taux de complétion</div>
                      <div className="stat-value">{best.Taux_Completion.toFixed(2)}%</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Objectif</div>
                      <div className="stat-value">{best.Objectif_Commercial.toLocaleString('fr-FR')} €</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">CA réalisé</div>
                      <div className="stat-value">{best.CA.toLocaleString('fr-FR')} €</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid-item">
            <div className="chart-container">
              <h3 className="chart-title">Performance à améliorer</h3>
              <div className="best-worst-container">
                <div className="worst-group">
                  <div className="group-name">{worst.Nom_Commercial || `Commercial ${worst.Groupe_Vendeur}`}</div>
                  <div className="group-stats">
                    <div className="stat-item">
                      <div className="stat-label">Taux de complétion</div>
                      <div className="stat-value">{worst.Taux_Completion.toFixed(2)}%</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Objectif</div>
                      <div className="stat-value">{worst.Objectif_Commercial.toLocaleString('fr-FR')} €</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">CA réalisé</div>
                      <div className="stat-value">{worst.CA.toLocaleString('fr-FR')} €</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Objectifs; 