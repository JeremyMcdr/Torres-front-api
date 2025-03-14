const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

// Récupérer les variables d'environnement avec des valeurs par défaut
const DB_USER = process.env.DB_USER || 'sa';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Password123';
const DB_NAME = process.env.DB_NAME || 'TorresDB';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 1433;

console.log('Connexion à la base de données avec les paramètres suivants:');
console.log(`Serveur: ${DB_HOST}:${DB_PORT}`);
console.log(`Base de données: ${DB_NAME}`);
console.log(`Utilisateur: ${DB_USER}`);

const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  server: DB_HOST,
  port: parseInt(DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Créer un pool de connexion réutilisable
const pool = new sql.ConnectionPool(sqlConfig);
const poolConnect = pool.connect();

// Gérer les erreurs de connexion
poolConnect.catch(err => {
  console.error('Erreur de connexion à la base de données:', err);
});

// Fonction pour exécuter des requêtes SQL
async function executeQuery(query, params = []) {
  try {
    await poolConnect;
    const request = pool.request();
    
    // Ajouter les paramètres à la requête
    params.forEach((param, index) => {
      request.input(`param${index}`, param.value);
      query = query.replace(`@param${index}`, `@param${index}`);
    });
    
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('Erreur lors de l\'exécution de la requête:', err);
    throw err;
  }
}

module.exports = {
  sql,
  pool,
  executeQuery
}; 