const commercialModel = require('../models/commercialModel');

// Contrôleur pour les données des commerciaux
const commercialController = {
  // Récupérer le pourcentage de commandes par commercial et par année
  async getPourcentageCommandesCommercial(req, res) {
    try {
      const filters = req.query;
      const data = await commercialModel.getPourcentageCommandesCommercial(filters);
      res.json(data);
    } catch (error) {
      console.error('Erreur lors de la récupération du pourcentage de commandes par commercial:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },
  
  // Récupérer le taux de réussite des commerciaux
  async getTauxReussiteCommercial(req, res) {
    try {
      const filters = req.query;
      const data = await commercialModel.getTauxReussiteCommercial(filters);
      res.json(data);
    } catch (error) {
      console.error('Erreur lors de la récupération du taux de réussite des commerciaux:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },
  
  // Récupérer les temps de conversion par commercial
  async getTempsConversion(req, res) {
    try {
      const filters = req.query;
      const data = await commercialModel.getTempsConversion(filters);
      res.json(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des temps de conversion par commercial:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },
  
  // Récupérer les commerciaux disponibles
  async getAvailableCommerciaux(req, res) {
    try {
      const commerciaux = await commercialModel.getAvailableCommerciaux();
      res.json(commerciaux);
    } catch (error) {
      console.error('Erreur lors de la récupération des commerciaux disponibles:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },
  
  // Récupérer les groupes de vendeurs disponibles
  async getAvailableGroupesVendeurs(req, res) {
    try {
      const groupesVendeurs = await commercialModel.getAvailableGroupesVendeurs();
      res.json(groupesVendeurs);
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes de vendeurs disponibles:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  }
};

module.exports = commercialController; 