import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Service pour les données de chiffre d'affairess
export const caService = {
  // Récupérer le CA par pays et par année
  getCAByPaysAnnee: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/ca/pays-annee`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du CA par pays et année:', error);
      throw error;
    }
  },
  
  // Récupérer le CA par vendeur et par année
  getCAByVendeurAnnee: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/ca/vendeur-annee`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du CA par vendeur et année:', error);
      throw error;
    }
  },
  
  // Récupérer le CA total par année
  getCATotalByAnnee: async (annee) => {
    try {
      const response = await axios.get(`${API_URL}/ca/total/${annee}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du CA total par année:', error);
      throw error;
    }
  },
  
  // Récupérer les années disponibles
  getAvailableYears: async () => {
    try {
      const response = await axios.get(`${API_URL}/ca/years`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des années disponibles:', error);
      throw error;
    }
  },
  
  // Récupérer les pays disponibles
  getAvailableCountries: async () => {
    try {
      const response = await axios.get(`${API_URL}/ca/countries`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des pays disponibles:', error);
      throw error;
    }
  }
};

// Service pour les données des commerciaux
export const commercialService = {
  // Récupérer le pourcentage de commandes par commercial et par année
  getPourcentageCommandesCommercial: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/commerciaux/pourcentage-commandes`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du pourcentage de commandes par commercial:', error);
      throw error;
    }
  },
  
  // Récupérer le taux de réussite des commerciaux
  getTauxReussiteCommercial: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/commerciaux/taux-reussite`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du taux de réussite des commerciaux:', error);
      throw error;
    }
  },
  
  // Récupérer les commerciaux disponibles
  getAvailableCommerciaux: async () => {
    try {
      const response = await axios.get(`${API_URL}/commerciaux/list`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commerciaux disponibles:', error);
      throw error;
    }
  },
  
  // Récupérer les groupes de vendeurs disponibles
  getAvailableGroupesVendeurs: async () => {
    try {
      const response = await axios.get(`${API_URL}/commerciaux/groupes-vendeurs`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes de vendeurs disponibles:', error);
      throw error;
    }
  }
};

// Service pour les données des motifs de commande
export const motifService = {
  // Récupérer le pourcentage de motifs par année
  getPourcentageMotifsByAnnee: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/motifs/pourcentage`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du pourcentage de motifs par année:', error);
      throw error;
    }
  },
  
  // Récupérer les motifs de commande disponibles
  getAvailableMotifs: async () => {
    try {
      const response = await axios.get(`${API_URL}/motifs/list`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des motifs disponibles:', error);
      throw error;
    }
  }
};

// Service pour les données des objectifs commerciaux
export const objectifService = {
  // Récupérer les objectifs commerciaux
  async getObjectifsCommerciaux(filters = {}) {
    try {
      let url = `${API_URL}/objectifs`;
      
      // Ajouter les filtres à l'URL
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        });
        url += `?${queryParams.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des objectifs commerciaux');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  },
  
  // Récupérer le taux de complétion des objectifs
  async getTauxCompletionObjectifs(filters = {}) {
    try {
      let url = `${API_URL}/objectifs/taux-completion`;
      
      // Ajouter les filtres à l'URL
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        });
        url += `?${queryParams.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du taux de complétion des objectifs');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  },
  
  // Récupérer la projection du CA pour l'année en cours
  async getProjectionCA(groupe_vendeur, annee) {
    try {
      const url = `${API_URL}/objectifs/projection?groupe_vendeur=${groupe_vendeur}&annee=${annee}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la projection du CA');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  },
  
  // Récupérer l'évolution des objectifs et du CA par groupe de vendeur
  async getEvolutionObjectifsCA(groupe_vendeur) {
    try {
      let url = `${API_URL}/objectifs/evolution`;
      
      // Ajouter le filtre de groupe de vendeur si spécifiés
      if (groupe_vendeur) {
        url += `?groupe_vendeur=${groupe_vendeur}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'évolution des objectifs et du CA');
      }
      
      const data = await response.json();
      
      // Trier les données par année pour assurer l'ordre chronologique
      return data.sort((a, b) => a.Annee - b.Annee);
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  }
}; 