const { executeQuery } = require('../db');

// Modèle pour les données des motifs de commande
const motifModel = {
  // Récupérer le pourcentage de motifs par année
  async getPourcentageMotifsByAnnee(filters = {}) {
    let query = `SELECT Annee, Motif_Commande, Pourcentage FROM dbo.Table_Faits_Pourcentage_Motifs_Annee WHERE 1=1`;
    const params = [];
    
    if (filters.annee && filters.annee !== 'all') {
      query += ` AND Annee = @param${params.length}`;
      params.push({ value: filters.annee });
    }
    
    if (filters.motif) {
      query += ` AND Motif_Commande = @param${params.length}`;
      params.push({ value: filters.motif });
    }
    
    return executeQuery(query, params);
  },
  
  // Récupérer les motifs de commande disponibles
  async getAvailableMotifs() {
    const query = `SELECT DISTINCT Motif_Commande FROM dbo.Table_Faits_Pourcentage_Motifs_Annee ORDER BY Motif_Commande`;
    return executeQuery(query);
  }
};

module.exports = motifModel; 