const { executeQuery } = require('../db');

// Modèle pour les données de chiffre d'affaires
const caModel = {
  // Récupérer le CA par pays et par année
  async getCAByPaysAnnee(filters = {}) {
    let query = `
      SELECT 
        Pays, 
        Annee, 
        CA 
      FROM dbo.Table_Faits_CA_Pays_Annee 
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.pays) {
      query += ` AND Pays = @param${params.length}`;
      params.push({ value: filters.pays });
    }
    
    if (filters.annee && filters.annee !== 'all') {
      query += ` AND Annee = @param${params.length}`;
      params.push({ value: filters.annee });
    }
    
    const results = await executeQuery(query, params);
    
    // Convertir les valeurs de CA en nombres côté serveur
    return results.map(item => {
      try {
        // Nettoyer et convertir la valeur en nombre
        const caStr = item.CA.toString().replace(/\s/g, '').replace(',', '.');
        const ca = parseFloat(caStr);
        return {
          ...item,
          CA: isNaN(ca) ? 0 : ca
        };
      } catch (error) {
        console.error('Erreur lors de la conversion du CA:', error);
        return {
          ...item,
          CA: 0
        };
      }
    });
  },
  
  // Récupérer le CA par vendeur et par année
  async getCAByVendeurAnnee(filters = {}) {
    let query = `
      SELECT 
        Groupe_Vendeur, 
        Annee, 
        CA 
      FROM dbo.Table_Faits_CA_Vendeur_Annee 
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.groupe_vendeur) {
      query += ` AND Groupe_Vendeur = @param${params.length}`;
      params.push({ value: filters.groupe_vendeur });
    }
    
    if (filters.annee && filters.annee !== 'all') {
      query += ` AND Annee = @param${params.length}`;
      params.push({ value: filters.annee });
    }
    
    const results = await executeQuery(query, params);
    
    // Convertir les valeurs de CA en nombres côté serveur
    return results.map(item => {
      try {
        // Nettoyer et convertir la valeur en nombre
        const caStr = item.CA.toString().replace(/\s/g, '').replace(',', '.');
        const ca = parseFloat(caStr);
        return {
          ...item,
          CA: isNaN(ca) ? 0 : ca
        };
      } catch (error) {
        console.error('Erreur lors de la conversion du CA:', error);
        return {
          ...item,
          CA: 0
        };
      }
    });
  },
  
  // Récupérer le CA total par année
  async getCATotalByAnnee(annee) {
    // Si annee est 'all', récupérer le CA total pour toutes les années
    let query;
    let params = [];
    
    if (annee === 'all') {
      query = `SELECT Annee, CA FROM dbo.Table_Faits_CA_Pays_Annee`;
    } else {
      query = `SELECT Annee, CA FROM dbo.Table_Faits_CA_Pays_Annee WHERE Annee = @param0`;
      params.push({ value: annee });
    }
    
    const results = await executeQuery(query, params);
    
    // Calculer le total en JavaScript
    let caTotal = 0;
    
    results.forEach(item => {
      try {
        // Nettoyer et convertir la valeur en nombre
        const caStr = item.CA.toString().replace(/\s/g, '').replace(',', '.');
        const ca = parseFloat(caStr);
        if (!isNaN(ca)) {
          caTotal += ca;
        }
      } catch (error) {
        console.error('Erreur lors de la conversion du CA:', error);
      }
    });
    
    return [{ CA_Total: caTotal }];
  },
  
  // Récupérer les années disponibles
  async getAvailableYears() {
    const query = `SELECT DISTINCT Annee FROM dbo.Table_Faits_CA_Pays_Annee ORDER BY Annee`;
    return executeQuery(query);
  },
  
  // Récupérer les pays disponibles
  async getAvailableCountries() {
    const query = `SELECT DISTINCT Pays FROM dbo.Table_Faits_CA_Pays_Annee ORDER BY Pays`;
    return executeQuery(query);
  }
};

module.exports = caModel; 