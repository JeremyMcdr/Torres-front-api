const express = require('express');
const router = express.Router();
const commercialController = require('../controllers/commercialController');

// Routes pour les données des commerciaux
router.get('/pourcentage-commandes', commercialController.getPourcentageCommandesCommercial);
router.get('/taux-reussite', commercialController.getTauxReussiteCommercial);
router.get('/list', commercialController.getAvailableCommerciaux);
router.get('/groupes-vendeurs', commercialController.getAvailableGroupesVendeurs);

module.exports = router; 