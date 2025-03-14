const express = require('express');
const router = express.Router();
const caController = require('../controllers/caController');

// Routes pour les données de chiffre d'affaires
router.get('/pays-annee', caController.getCAByPaysAnnee);
router.get('/vendeur-annee', caController.getCAByVendeurAnnee);
router.get('/total/:annee', caController.getCATotalByAnnee);
router.get('/years', caController.getAvailableYears);
router.get('/countries', caController.getAvailableCountries);

module.exports = router; 