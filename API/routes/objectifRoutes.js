const express = require('express');
const router = express.Router();
const objectifModel = require('../models/objectifModel');

// Route pour récupérer les objectifs commerciaux
router.get('/', async (req, res) => {
  try {
    const filters = {
      annee: req.query.annee,
      groupe_vendeur: req.query.groupe_vendeur
    };
    
    const objectifs = await objectifModel.getObjectifsCommerciaux(filters);
    res.json(objectifs);
  } catch (error) {
    console.error('Erreur lors de la récupération des objectifs commerciaux:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des objectifs commerciaux' });
  }
});

// Route pour récupérer le taux de complétion des objectifs
router.get('/taux-completion', async (req, res) => {
  try {
    const filters = {
      annee: req.query.annee,
      groupe_vendeur: req.query.groupe_vendeur
    };
    
    const tauxCompletion = await objectifModel.getTauxCompletionObjectifs(filters);
    res.json(tauxCompletion);
  } catch (error) {
    console.error('Erreur lors de la récupération du taux de complétion des objectifs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du taux de complétion des objectifs' });
  }
});

// Route pour récupérer la projection du CA pour l'année en cours
router.get('/projection', async (req, res) => {
  try {
    const { groupe_vendeur, annee } = req.query;
    
    if (!groupe_vendeur || !annee) {
      return res.status(400).json({ error: 'Les paramètres groupe_vendeur et annee sont requis' });
    }
    
    const projection = await objectifModel.getProjectionCA(groupe_vendeur, annee);
    res.json(projection);
  } catch (error) {
    console.error('Erreur lors de la récupération de la projection du CA:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la projection du CA' });
  }
});

// Route pour récupérer l'évolution des objectifs et du CA
router.get('/evolution', async (req, res) => {
  try {
    const { groupe_vendeur } = req.query;
    
    const evolution = await objectifModel.getEvolutionObjectifsCA(groupe_vendeur);
    res.json(evolution);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'évolution des objectifs et du CA:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'évolution des objectifs et du CA' });
  }
});

module.exports = router; 