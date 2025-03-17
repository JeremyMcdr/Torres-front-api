const { executeQuery } = require('../db');

// Modèle pour les données des commerciaux
const commercialModel = {
  // Récupérer le pourcentage de commandes par commercial et par année
  async getPourcentageCommandesCommercial(filters = {}) {
    let query = `
      SELECT 
        pc.Commercial, 
        ISNULL(c.COM_NomVendeur_TEXTVGRT, 'Commercial ' + CAST(pc.Commercial AS VARCHAR(20))) AS Nom_Commercial,
        pc.Annee, 
        pc.Nombre_Offres, 
        pc.Nombre_Commandes, 
        pc.Pourcentage_Commandes 
      FROM dbo.Table_Faits_Pourcentage_Commandes_Commercial pc
      LEFT JOIN dbo.Commerciaux c ON pc.Commercial = c.COM_GroupeVendeur_VKGRP
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.commercial) {
      query += ` AND pc.Commercial = @param${params.length}`;
      params.push({ value: filters.commercial });
    }
    
    if (filters.annee && filters.annee !== 'all') {
      query += ` AND pc.Annee = @param${params.length}`;
      params.push({ value: filters.annee });
    }
    
    return executeQuery(query, params);
  },
  
  // Récupérer le taux de réussite des commerciaux
  async getTauxReussiteCommercial(filters = {}) {
    let query = `
      SELECT 
        pc.Commercial, 
        ISNULL(c.COM_NomVendeur_TEXTVGRT, 'Commercial ' + CAST(pc.Commercial AS VARCHAR(20))) AS Nom_Commercial,
        pc.Annee, 
        pc.Nombre_Offres, 
        pc.Nombre_Commandes, 
        pc.Pourcentage_Commandes,
        CAST(pc.Nombre_Commandes AS FLOAT) / NULLIF(pc.Nombre_Offres, 0) * 100 AS Taux_Reussite
      FROM dbo.Table_Faits_Pourcentage_Commandes_Commercial pc
      LEFT JOIN dbo.Commerciaux c ON pc.Commercial = c.COM_GroupeVendeur_VKGRP
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.commercial) {
      query += ` AND pc.Commercial = @param${params.length}`;
      params.push({ value: filters.commercial });
    }
    
    if (filters.annee && filters.annee !== 'all') {
      query += ` AND pc.Annee = @param${params.length}`;
      params.push({ value: filters.annee });
    }
    
    return executeQuery(query, params);
  },
  
  // Récupérer les temps de conversion par commercial
  async getTempsConversion(filters = {}) {
    let query = `
      SELECT 
        tc.Commercial,
        ISNULL(c.COM_NomVendeur_TEXTVGRT, 'Commercial ' + CAST(tc.Commercial AS VARCHAR(20))) AS Nom_Commercial,
        tc.Nombre_Conversions,
        tc.Temps_Moyen_Conversion
      FROM dbo.Table_Faits_Temps_Conversion tc
      LEFT JOIN dbo.Commerciaux c ON tc.Commercial = c.COM_GroupeVendeur_VKGRP
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.commercial) {
      query += ` AND tc.Commercial = @param${params.length}`;
      params.push({ value: filters.commercial });
    }
    
    query += ` ORDER BY tc.Nombre_Conversions DESC`;
    
    return executeQuery(query, params);
  },
  
  // Récupérer les commerciaux disponibles
  async getAvailableCommerciaux() {
    const query = `
      SELECT DISTINCT 
        pc.Commercial,
        ISNULL(c.COM_NomVendeur_TEXTVGRT, 'Commercial ' + CAST(pc.Commercial AS VARCHAR(20))) AS Nom_Commercial
      FROM dbo.Table_Faits_Pourcentage_Commandes_Commercial pc
      LEFT JOIN dbo.Commerciaux c ON pc.Commercial = c.COM_GroupeVendeur_VKGRP
      ORDER BY pc.Commercial
    `;
    return executeQuery(query);
  },
  
  // Récupérer les groupes de vendeurs disponibles
  async getAvailableGroupesVendeurs() {
    const query = `
      SELECT DISTINCT 
        ca.Groupe_Vendeur,
        ISNULL(c.COM_NomVendeur_TEXTVGRT, 'Commercial ' + CAST(ca.Groupe_Vendeur AS VARCHAR(20))) AS Nom_Commercial
      FROM dbo.Table_Faits_CA_Vendeur_Annee ca
      LEFT JOIN dbo.Commerciaux c ON ca.Groupe_Vendeur = c.COM_GroupeVendeur_VKGRP
      ORDER BY ca.Groupe_Vendeur
    `;
    return executeQuery(query);
  }
};

module.exports = commercialModel; 