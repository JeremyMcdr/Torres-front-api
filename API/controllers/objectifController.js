const objectifModel = require('../models/objectifModel');

// Contrôleur pour les données des objectifs commerciaux
const objectifController = {
  // Récupérer les objectifs commerciaux par année et groupe de vendeur
  async getObjectifsCommerciaux(req, res) {
    try {
      const filters = req.query;
      const data = await objectifModel.getObjectifsCommerciaux(filters);
      res.json(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des objectifs commerciaux:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },
  
  // Récupérer le taux de complétion des objectifs
  async getTauxCompletionObjectifs(req, res) {
    try {
      const filters = req.query;
      const data = await objectifModel.getTauxCompletionObjectifs(filters);
      res.json(data);
    } catch (error) {
      console.error('Erreur lors de la récupération du taux de complétion des objectifs:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },
  
  // Récupérer la projection du CA pour l'année en cours
  async getProjectionCA(req, res) {
    try {
      const { groupe_vendeur, annee } = req.params;
      const data = await objectifModel.getProjectionCA(groupe_vendeur, annee);
      res.json(data);
    } catch (error) {
      console.error('Erreur lors de la récupération de la projection du CA:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  }
};

module.exports = objectifController; 