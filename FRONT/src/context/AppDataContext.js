import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { caService, commercialService, motifService } from '../services/api'; // Import necessary services

// 1. Create the Context
const AppDataContext = createContext(null);

// 2. Create the Provider Component
export const AppDataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appData, setAppData] = useState({
    annees: [],
    pays: [],
    motifs: [],
    commerciaux: [],
    groupesVendeurs: [],
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("AppDataContext: Starting initial data load...");

        const [
          yearsData,
          countriesData,
          motifsData,
          commerciauxData,
          groupesData
        ] = await Promise.all([
          caService.getAvailableYears(),
          caService.getAvailableCountries(),
          motifService.getAvailableMotifs(),
          commercialService.getAvailableCommerciaux(),
          commercialService.getAvailableGroupesVendeurs()
        ]);

        console.log("AppDataContext: Raw data received", { yearsData, countriesData, motifsData, commerciauxData, groupesData });

        // Process and set data
        const processedData = {
          annees: yearsData.map(item => item.Annee).sort((a, b) => b - a),
          pays: countriesData.map(item => item.Pays).sort(),
          motifs: [...new Set(motifsData.map(item => item.Motif_Commande))].sort(),
          commerciaux: commerciauxData.map(item => ({
            id: item.Commercial,
            nom: item.Nom_Commercial || `Commercial ${item.Commercial}`
          })).sort((a, b) => a.nom.localeCompare(b.nom)),
          groupesVendeurs: groupesData.map(item => ({ // Ensure consistent structure if needed later
             id: item.Groupe_Vendeur, // Assuming Groupe_Vendeur is the ID
             nom: item.Nom_Commercial || `Groupe ${item.Groupe_Vendeur}` // Use Nom_Commercial if available
          })).sort((a, b) => a.nom.localeCompare(b.nom)),
        };

        console.log("AppDataContext: Processed data", processedData);
        setAppData(processedData);
        setError(null); // Clear any previous error on success

      } catch (err) {
        console.error('AppDataContext: Error loading initial data:', err);
        setError('Impossible de charger les données initiales de l\'application. Veuillez réessayer.');
        // Keep potentially partial data in appData if needed, or clear it:
        // setAppData({ annees: [], pays: [], motifs: [], commerciaux: [], groupesVendeurs: [] });
      } finally {
        setLoading(false);
        console.log("AppDataContext: Initial data load finished.");
      }
    };

    loadInitialData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    loading,
    error,
    appData,
  }), [loading, error, appData]);

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

// 3. Create a Custom Hook for easy consumption
export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}; 