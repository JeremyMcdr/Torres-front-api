const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

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

async function executeScript() {
  try {
    // Lire le contenu du script SQL
    const scriptPath = path.join(__dirname, 'create-tables.sql');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    console.log('Connexion à la base de données...');
    
    // Établir la connexion
    await sql.connect(sqlConfig);
    
    console.log('Connexion établie avec succès. Exécution du script SQL...');
    
    // Exécuter le script SQL
    await sql.query(scriptContent);
    
    console.log('Script SQL exécuté avec succès. Tables créées et données insérées.');
    
  } catch (err) {
    console.error('Erreur lors de l\'exécution du script:', err);
  } finally {
    // Fermer la connexion
    await sql.close();
  }
}

// Exécuter le script
executeScript(); 