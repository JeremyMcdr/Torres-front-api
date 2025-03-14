const { executeQuery } = require('../db');

// Modèle pour les données des commerciaux
const commercialModel = {
  // Récupérer le pourcentage de commandes par commercial et par année
  async getPourcentageCommandesCommercial(filters = {}) {
    let query = `SELECT Commercial, Annee, Nombre_Offres, Nombre_Commandes, Pourcentage_Commandes 
                FROM dbo.Table_Faits_Pourcentage_Commandes_Commercial WHERE 1=1`;
    const params = [];
    
    if (filters.commercial) {
      query += ` AND Commercial = @param${params.length}`;
      params.push({ value: filters.commercial });
    }
    
    if (filters.annee && filters.annee !== 'all') {
      query += ` AND Annee = @param${params.length}`;
      params.push({ value: filters.annee });
    }
    
    return executeQuery(query, params);
  },
  
  // Récupérer le taux de réussite des commerciaux
  async getTauxReussiteCommercial(filters = {}) {
    let query = `
      SELECT 
        Commercial, 
        Annee, 
        Nombre_Offres, 
        Nombre_Commandes, 
        Pourcentage_Commandes,
        CAST(Nombre_Commandes AS FLOAT) / NULLIF(Nombre_Offres, 0) * 100 AS Taux_Reussite
      FROM dbo.Table_Faits_Pourcentage_Commandes_Commercial 
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.commercial) {
      query += ` AND Commercial = @param${params.length}`;
      params.push({ value: filters.commercial });
    }
    
    if (filters.annee && filters.annee !== 'all') {
      query += ` AND Annee = @param${params.length}`;
      params.push({ value: filters.annee });
    }
    
    return executeQuery(query, params);
  },
  
  // Récupérer les commerciaux disponibles
  async getAvailableCommerciaux() {
    const query = `SELECT DISTINCT Commercial FROM dbo.Table_Faits_Pourcentage_Commandes_Commercial ORDER BY Commercial`;
    return executeQuery(query);
  },
  
  // Récupérer les groupes de vendeurs disponibles
  async getAvailableGroupesVendeurs() {
    const query = `SELECT DISTINCT Groupe_Vendeur FROM dbo.Table_Faits_CA_Vendeur_Annee ORDER BY Groupe_Vendeur`;
    return executeQuery(query);
  }
};

module.exports = commercialModel; 