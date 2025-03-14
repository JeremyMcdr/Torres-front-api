const express = require('express');
const router = express.Router();
const motifController = require('../controllers/motifController');

// Routes pour les données des motifs de commande
router.get('/pourcentage', motifController.getPourcentageMotifsByAnnee);
router.get('/list', motifController.getAvailableMotifs);

module.exports = router; 