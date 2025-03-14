const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

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