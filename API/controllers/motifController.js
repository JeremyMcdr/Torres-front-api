const motifModel = require('../models/motifModel');

// Contrôleur pour les données des motifs de commande
const motifController = {
  // Récupérer le pourcentage de motifs par année
  async getPourcentageMotifsByAnnee(req, res) {
    try {
      const filters = req.query;
      const data = await motifModel.getPourcentageMotifsByAnnee(filters);
      res.json(data);
    } catch (error) {
      console.error('Erreur lors de la récupération du pourcentage de motifs par année:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },
  
  // Récupérer les motifs de commande disponibles
  async getAvailableMotifs(req, res) {
    try {
      const motifs = await motifModel.getAvailableMotifs();
      res.json(motifs);
    } catch (error) {
      console.error('Erreur lors de la récupération des motifs disponibles:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  }
};

module.exports = motifController; 