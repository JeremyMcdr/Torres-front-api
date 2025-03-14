const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sql = require('mssql');

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuration de la connexion à SQL Server
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER.split(',')[0],
  port: parseInt(process.env.DB_SERVER.split(',')[1]),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Pool de connexion SQL
let pool;

// Initialiser la connexion à la base de données
async function initializeDbConnection() {
  try {
    pool = await sql.connect(sqlConfig);
    console.log('Connexion à la base de données établie avec succès');
  } catch (err) {
    console.error('Erreur de connexion à la base de données:', err);
    process.exit(1);
  }
}

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
  await initializeDbConnection();
  
  app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
  });
}

// Gérer les erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('Erreur non gérée:', err);
});

// Exporter le pool de connexion pour les autres modules
module.exports = {
  sql,
  pool,
  startServer
};

// Démarrer le serveur si ce fichier est exécuté directement
if (require.main === module) {
  startServer();
} 