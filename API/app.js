const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Créer l'application Express
const app = express();

// Configurer les middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Importer les routes
const caRoutes = require('./routes/caRoutes');
const commercialRoutes = require('./routes/commercialRoutes');
const motifRoutes = require('./routes/motifRoutes');
const objectifRoutes = require('./routes/objectifRoutes');

// Configurer les routes
app.use('/api/ca', caRoutes);
app.use('/api/commerciaux', commercialRoutes);
app.use('/api/motifs', motifRoutes);
app.use('/api/objectifs', objectifRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.json({ message: 'API Dashboard Torres' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur est survenue sur le serveur' });
});

// Définir le port
const PORT = process.env.PORT || 3001;

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} v1.0.0`);
});

module.exports = app; 