const caModel = require('../models/caModel');

// Contrôleur pour les données de chiffre d'affaires
const caController = {
  // Récupérer le CA par pays et par année
  async getCAByPaysAnnee(req, res) {
    try {
      const filters = req.query;
      const data = await caModel.getCAByPaysAnnee(filters);
      res.json(data);
    } catch (error) {
      console.error('Erreur lors de la récupération du CA par pays et année:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },
  
  // Récupérer le CA par vendeur et par année
  async getCAByVendeurAnnee(req, res) {
    try {
      const filters = req.query;
      const data = await caModel.getCAByVendeurAnnee(filters);
      res.json(data);
    } catch (error) {
      console.error('Erreur lors de la récupération du CA par vendeur et année:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },
  
  // Récupérer le CA total par année
  async getCATotalByAnnee(req, res) {
    try {
      const { annee } = req.params;
      const data = await caModel.getCATotalByAnnee(annee);
      res.json(data);
    } catch (error) {
      console.error('Erreur lors de la récupération du CA total par année:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },
  
  // Récupérer les années disponibles
  async getAvailableYears(req, res) {
    try {
      const years = await caModel.getAvailableYears();
      res.json(years);
    } catch (error) {
      console.error('Erreur lors de la récupération des années disponibles:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },
  
  // Récupérer les pays disponibles
  async getAvailableCountries(req, res) {
    try {
      const countries = await caModel.getAvailableCountries();
      res.json(countries);
    } catch (error) {
      console.error('Erreur lors de la récupération des pays disponibles:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  }
};

module.exports = caController; 