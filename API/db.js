const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

// Récupérer les variables d'environnement avec des valeurs par défaut
const DB_USER = process.env.DB_USER || 'sa';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Password123!';
const DB_NAME = process.env.DB_NAME || 'TP_CSID';
const DB_HOST = process.env.DB_HOST || '159.203.139.99';
const DB_PORT = process.env.DB_PORT || 1433;

// Configuration de la connexion à la base de données
const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  server: DB_HOST,
  port: parseInt(DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  },
};

// Fonction pour attendre un certain temps
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Classe singleton pour gérer la connexion à la base de données
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
    
    this.pool = null;
    this.connectionPromise = null;
    this.isConnecting = false;
    
    DatabaseConnection.instance = this;
  }
  
  // Fonction pour obtenir une connexion à la base de données
  async getConnection() {
    // Si nous avons déjà un pool connecté, le retourner
    if (this.pool && this.pool.connected) {
      return this.pool;
    }
    
    // Si une connexion est déjà en cours, attendre qu'elle se termine
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }
    
    // Sinon, créer une nouvelle connexion
    this.isConnecting = true;
    this.connectionPromise = this._initializeConnection();
    
    try {
      this.pool = await this.connectionPromise;
      return this.pool;
    } catch (err) {
      throw err;
    } finally {
      this.isConnecting = false;
    }
  }
  
  // Fonction pour initialiser la connexion avec tentatives
  async _initializeConnection(maxRetries = 5, retryDelay = 3000) {
    console.log('Connexion à la base de données avec les paramètres suivants:');
    console.log(`Serveur: ${DB_HOST}:${DB_PORT}`);
    console.log(`Base de données: ${DB_NAME}`);
    console.log(`Utilisateur: ${DB_USER}`);
    console.log('Configuration SQL complète:', JSON.stringify(sqlConfig, null, 2).replace(/"password":"[^"]*"/, '"password":"***"'));
    
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        if (retries > 0) {
          console.log(`Tentative de connexion ${retries + 1}/${maxRetries}...`);
        } else {
          console.log('Tentative de connexion à la base de données...');
        }
        
        const newPool = new sql.ConnectionPool(sqlConfig);
        await newPool.connect();
        
        console.log('Connexion à la base de données établie avec succès');
        return newPool;
      } catch (err) {
        retries++;
        console.error(`Échec de la connexion (tentative ${retries}/${maxRetries}):`, err.message);
        
        if (retries < maxRetries) {
          console.log(`Nouvelle tentative dans ${retryDelay/1000} secondes...`);
          await sleep(retryDelay);
        } else {
          console.error('Nombre maximum de tentatives atteint. Impossible de se connecter à la base de données.');
          throw err;
        }
      }
    }
  }
  
  // Fonction pour exécuter des requêtes SQL
  async executeQuery(query, params = []) {
    try {
      // Obtenir une connexion
      const connection = await this.getConnection();
      
      const request = connection.request();
      
      // Ajouter les paramètres à la requête
      params.forEach((param, index) => {
        request.input(`param${index}`, param.value);
        query = query.replace(`@param${index}`, `@param${index}`);
      });
      
      console.log('Exécution de la requête SQL:', query);
      const result = await request.query(query);
      console.log('Requête SQL exécutée avec succès, nombre d\'enregistrements:', result.recordset ? result.recordset.length : 0);
      return result.recordset;
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la requête:', err);
      throw err;
    }
  }
}

// Créer une instance unique de la connexion à la base de données
const dbConnection = new DatabaseConnection();

// Exporter les fonctions et objets nécessaires
module.exports = {
  sql,
  getConnection: () => dbConnection.getConnection(),
  executeQuery: (query, params) => dbConnection.executeQuery(query, params)
}; 