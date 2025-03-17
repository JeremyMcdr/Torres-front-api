const { executeQuery } = require('../db');

// Modèle pour les données des objectifs commerciaux
const objectifModel = {
  // Récupérer les objectifs commerciaux par année et groupe de vendeur
  async getObjectifsCommerciaux(filters = {}) {
    let query = `
      SELECT 
        o.Annee, 
        o.Groupe_Vendeur,
        ISNULL(c.COM_NomVendeur_TEXTVGRT, 'Commercial ' + CAST(o.Groupe_Vendeur AS VARCHAR(20))) AS Nom_Commercial,
        o.Objectif_Commercial, 
        o.CA 
      FROM dbo.Table_Faits_CA_Objectif_Commercial_Annee o
      LEFT JOIN dbo.Commerciaux c ON o.Groupe_Vendeur = c.COM_GroupeVendeur_VKGRP
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.annee && filters.annee !== 'all') {
      query += ` AND o.Annee = @param${params.length}`;
      params.push({ value: filters.annee });
    }
    
    if (filters.groupe_vendeur) {
      query += ` AND o.Groupe_Vendeur = @param${params.length}`;
      params.push({ value: filters.groupe_vendeur });
    }
    
    const results = await executeQuery(query, params);
    
    // Convertir les valeurs en nombres côté serveur
    return results.map(item => {
      try {
        // Nettoyer et convertir les valeurs en nombres
        const caStr = item.CA ? item.CA.toString().replace(/\s/g, '').replace(',', '.') : '0';
        const objectifStr = item.Objectif_Commercial ? item.Objectif_Commercial.toString().replace(/\s/g, '').replace(',', '.') : '0';
        
        return {
          ...item,
          CA: parseFloat(caStr) || 0,
          Objectif_Commercial: parseFloat(objectifStr) || 0
        };
      } catch (error) {
        console.error('Erreur lors de la conversion des valeurs:', error);
        return {
          ...item,
          CA: 0,
          Objectif_Commercial: 0
        };
      }
    });
  },
  
  // Récupérer le taux de complétion des objectifs
  async getTauxCompletionObjectifs(filters = {}) {
    // D'abord, récupérer les données brutes
    let query = `
      SELECT 
        o.Annee, 
        o.Groupe_Vendeur,
        ISNULL(c.COM_NomVendeur_TEXTVGRT, 'Commercial ' + CAST(o.Groupe_Vendeur AS VARCHAR(20))) AS Nom_Commercial,
        o.Objectif_Commercial, 
        o.CA
      FROM dbo.Table_Faits_CA_Objectif_Commercial_Annee o
      LEFT JOIN dbo.Commerciaux c ON o.Groupe_Vendeur = c.COM_GroupeVendeur_VKGRP
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.annee && filters.annee !== 'all') {
      query += ` AND o.Annee = @param${params.length}`;
      params.push({ value: filters.annee });
    }
    
    if (filters.groupe_vendeur) {
      query += ` AND o.Groupe_Vendeur = @param${params.length}`;
      params.push({ value: filters.groupe_vendeur });
    }
    
    const results = await executeQuery(query, params);
    
    // Calculer le taux de complétion en JavaScript
    return results.map(item => {
      try {
        // Nettoyer et convertir les valeurs en nombres
        const caStr = item.CA ? item.CA.toString().replace(/\s/g, '').replace(',', '.') : '0';
        const objectifStr = item.Objectif_Commercial ? item.Objectif_Commercial.toString().replace(/\s/g, '').replace(',', '.') : '0';
        
        // Convertir en nombres
        const ca = parseFloat(caStr) || 0;
        const objectif = parseFloat(objectifStr) || 0;
        
        // Calculer le taux de complétion (gérer le cas où l'objectif est négatif)
        let tauxCompletion = 0;
        if (objectif !== 0) {
          // Si l'objectif est négatif, le taux de complétion est inversé
          if (objectif < 0) {
            tauxCompletion = (1 - (ca / Math.abs(objectif))) * 100;
          } else {
            tauxCompletion = (ca / objectif) * 100;
          }
        }
        
        return {
          ...item,
          CA: ca,
          Objectif_Commercial: objectif,
          Taux_Completion: tauxCompletion
        };
      } catch (error) {
        console.error('Erreur lors du calcul du taux de complétion:', error);
        return {
          ...item,
          CA: 0,
          Objectif_Commercial: 0,
          Taux_Completion: 0
        };
      }
    });
  },
  
  // Récupérer la projection du CA pour l'année en cours
  async getProjectionCA(groupe_vendeur, annee_en_cours) {
    // Si annee_en_cours est 'all', on ne peut pas faire de projection
    if (annee_en_cours === 'all') {
      return [{ message: "Impossible de faire une projection pour toutes les années. Veuillez sélectionner une année spécifique." }];
    }
    
    // Récupérer les données brutes
    const query = `
      SELECT 
        o.CA, 
        o.Objectif_Commercial,
        ISNULL(c.COM_NomVendeur_TEXTVGRT, 'Commercial ' + CAST(o.Groupe_Vendeur AS VARCHAR(20))) AS Nom_Commercial
      FROM dbo.Table_Faits_CA_Objectif_Commercial_Annee o
      LEFT JOIN dbo.Commerciaux c ON o.Groupe_Vendeur = c.COM_GroupeVendeur_VKGRP
      WHERE o.Groupe_Vendeur = @param0 AND o.Annee = @param1
    `;
    
    const results = await executeQuery(query, [
      { value: groupe_vendeur },
      { value: annee_en_cours }
    ]);
    
    if (results.length === 0) {
      return [{ message: "Aucune donnée disponible pour cette projection." }];
    }
    
    try {
      // Calculer la projection en JavaScript
      const item = results[0];
      const moisActuel = new Date().getMonth() + 1; // Les mois commencent à 0 en JavaScript
      
      // Nettoyer et convertir les valeurs en nombres
      const caStr = item.CA ? item.CA.toString().replace(/\s/g, '').replace(',', '.') : '0';
      const objectifStr = item.Objectif_Commercial ? item.Objectif_Commercial.toString().replace(/\s/g, '').replace(',', '.') : '0';
      
      // Convertir en nombres
      const ca = parseFloat(caStr) || 0;
      const objectif = parseFloat(objectifStr) || 0;
      
      // Calculer la projection
      const projectionCAannuel = (ca / moisActuel) * 12;
      
      return [{
        CA: ca,
        Objectif_Commercial: objectif,
        Projection_CA: projectionCAannuel,
        Nom_Commercial: item.Nom_Commercial
      }];
    } catch (error) {
      console.error('Erreur lors du calcul de la projection:', error);
      return [{ message: "Erreur lors du calcul de la projection." }];
    }
  },
  
  // Récupérer l'évolution des objectifs et du CA par groupe de vendeur
  async getEvolutionObjectifsCA(groupe_vendeur) {
    let query = `
      SELECT 
        o.Annee, 
        o.Groupe_Vendeur, 
        o.Objectif_Commercial, 
        o.CA,
        ISNULL(c.COM_NomVendeur_TEXTVGRT, 'Commercial ' + CAST(o.Groupe_Vendeur AS VARCHAR(20))) AS Nom_Commercial
      FROM dbo.Table_Faits_CA_Objectif_Commercial_Annee o
      LEFT JOIN dbo.Commerciaux c ON o.Groupe_Vendeur = c.COM_GroupeVendeur_VKGRP
      WHERE 1=1
    `;
    const params = [];
    
    if (groupe_vendeur) {
      query += ` AND o.Groupe_Vendeur = @param${params.length}`;
      params.push({ value: groupe_vendeur });
    }
    
    query += ` ORDER BY o.Annee`;
    
    const results = await executeQuery(query, params);
    
    // Si un groupe de vendeur spécifique est demandé, retourner les données par année
    if (groupe_vendeur) {
      return results.map(item => {
        try {
          // Nettoyer et convertir les valeurs en nombres
          const caStr = item.CA ? item.CA.toString().replace(/\s/g, '').replace(',', '.') : '0';
          const objectifStr = item.Objectif_Commercial ? item.Objectif_Commercial.toString().replace(/\s/g, '').replace(',', '.') : '0';
          
          return {
            ...item,
            CA: parseFloat(caStr) || 0,
            Objectif_Commercial: parseFloat(objectifStr) || 0
          };
        } catch (error) {
          console.error('Erreur lors de la conversion des valeurs:', error);
          return {
            ...item,
            CA: 0,
            Objectif_Commercial: 0
          };
        }
      });
    } 
    // Sinon, agréger les données par année pour tous les groupes de vendeurs
    else {
      // Créer un objet pour stocker les totaux par année
      const totauxParAnnee = {};
      
      // Calculer les totaux par année
      results.forEach(item => {
        try {
          const annee = item.Annee;
          const caStr = item.CA ? item.CA.toString().replace(/\s/g, '').replace(',', '.') : '0';
          const objectifStr = item.Objectif_Commercial ? item.Objectif_Commercial.toString().replace(/\s/g, '').replace(',', '.') : '0';
          
          const ca = parseFloat(caStr) || 0;
          const objectif = parseFloat(objectifStr) || 0;
          
          if (!totauxParAnnee[annee]) {
            totauxParAnnee[annee] = {
              Annee: annee,
              CA_Total: 0,
              Objectif_Total: 0
            };
          }
          
          totauxParAnnee[annee].CA_Total += ca;
          totauxParAnnee[annee].Objectif_Total += objectif;
        } catch (error) {
          console.error('Erreur lors du calcul des totaux par année:', error);
        }
      });
      
      // Convertir l'objet en tableau et trier par année
      return Object.values(totauxParAnnee).sort((a, b) => a.Annee - b.Annee);
    }
  }
};

module.exports = objectifModel; 