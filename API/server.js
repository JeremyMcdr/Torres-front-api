const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sql, getConnection } = require('./db');

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Configuration CORS détaillée pour permettre les requêtes depuis le frontend local
const corsOptions = {
  origin: ['http://localhost:3000', 'https://torres.macadre.fr'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes API
app.get('/', (req, res) => {
  res.json({ message: 'API TP_CSID fonctionnelle' });
});

// Importer les routes
const caRoutes = require('./routes/caRoutes');
const commercialRoutes = require('./routes/commercialRoutes');
const motifRoutes = require('./routes/motifRoutes');
const objectifRoutes = require('./routes/objectifRoutes');

// Utiliser les routes
app.use('/api/ca', caRoutes);
app.use('/api/commerciaux', commercialRoutes);
app.use('/api/motifs', motifRoutes);
app.use('/api/objectifs', objectifRoutes);

// Port d'écoute
const PORT = process.env.PORT || 3001;

// Démarrer le serveur
async function startServer() {
  try {
    // Initialiser la connexion à la base de données
    await getConnection();
    
    app.listen(PORT, () => {
      console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
      console.log(`API accessible en mode développement sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Erreur lors du démarrage du serveur:', err);
    process.exit(1);
  }
}

// Gérer les erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('Erreur non gérée:', err);
});

// Exporter le module
module.exports = {
  startServer
};

// Démarrer le serveur si ce fichier est exécuté directement
if (require.main === module) {
  startServer();
} 