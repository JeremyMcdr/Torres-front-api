# Guide de déploiement de l'application Torres

Ce document explique comment l'application Torres est déployée automatiquement via GitHub Actions.

## Architecture

L'application est composée de deux parties principales :
- **API** : Une API Node.js (Express) exposée sur le port 3000
- **FRONT** : Une application React servie par Nginx sur le port 8080

## Méthode de déploiement

Le déploiement est automatisé via GitHub Actions et utilise Docker pour conteneuriser l'application.

### Workflows GitHub Actions

Trois workflows ont été configurés :

1. **api-deploy.yml** : Déploie uniquement l'API lorsque des modifications sont apportées au dossier API
2. **front-deploy.yml** : Déploie uniquement le FRONT lorsque des modifications sont apportées au dossier FRONT
3. **full-deploy.yml** : Déploie l'ensemble de l'application lorsque le fichier docker-compose.yml est modifié

### Secrets GitHub nécessaires

Les workflows utilisent les secrets GitHub suivants :

#### Secrets pour le déploiement
- `DOCKERHUB_USERNAME` : Nom d'utilisateur Docker Hub
- `DOCKERHUB_PASSWORD` : Mot de passe Docker Hub
- `HOST` : Adresse IP ou nom d'hôte du serveur de déploiement
- `USERNAME` : Nom d'utilisateur SSH pour se connecter au serveur
- `PASSWORD` : Mot de passe SSH pour se connecter au serveur
- `PORT` : Port SSH du serveur (généralement 22)

#### Secrets pour la base de données
- `DB_HOST` : Adresse du serveur de base de données
- `DB_PORT` : Port de la base de données (généralement 1433 pour SQL Server)
- `DB_NAME` : Nom de la base de données
- `DB_USER` : Nom d'utilisateur pour la connexion à la base de données
- `DB_PASSWORD` : Mot de passe pour la connexion à la base de données

## Configuration réseau Docker

L'application utilise deux réseaux Docker :
- **torres-network** : Réseau interne pour la communication entre l'API et le FRONT
- **nginx-proxy-manager_default** : Réseau externe pour la communication avec Nginx Proxy Manager

Cette configuration permet au reverse proxy d'accéder directement aux conteneurs par leur nom, sans passer par l'interface réseau externe du serveur.

### Configuration du reverse proxy

Le reverse proxy (Nginx Proxy Manager) doit être configuré pour pointer vers :
- **Front-end** : torres-front:80
- **API** : torres-api:3000

## Déploiement manuel

Si vous souhaitez déployer manuellement l'application, suivez ces étapes :

1. Clonez le dépôt sur votre serveur :
   ```bash
   git clone <URL_DU_REPO> torres-app
   cd torres-app
   ```

2. Créez un fichier .env avec les informations de connexion à la base de données :
   ```bash
   cat > .env << EOF
   DB_HOST=votre_serveur_db
   DB_PORT=1433
   DB_NAME=votre_base_de_donnees
   DB_USER=votre_utilisateur
   DB_PASSWORD=votre_mot_de_passe
   EOF
   ```

3. Déployez avec Docker Compose :
   ```bash
   docker-compose up -d
   ```

4. Connectez les conteneurs au réseau du reverse proxy :
   ```bash
   docker network connect nginx-proxy-manager_default torres-api
   docker network connect nginx-proxy-manager_default torres-front
   ```

## Vérification du déploiement

Une fois déployée, l'application est accessible :
- Front-end : http://torres.dashboard.macadie.fr
- API : http://torres.dashboard.macadie.fr/api
- Front-end direct : http://votre-serveur:8080
- API direct : http://votre-serveur:3000

## Maintenance

### Mise à jour de l'application

Les mises à jour sont automatiques lorsque vous poussez des modifications sur la branche `main`.

### Redémarrage des services

Si vous devez redémarrer les services manuellement :
```bash
cd ~/torres-app
docker-compose restart
```

### Visualisation des logs

Pour voir les logs des conteneurs :
```bash
# Logs de l'API
docker logs torres-api

# Logs du FRONT
docker logs torres-front

# Logs de tous les conteneurs
docker-compose logs
```

### Dépannage de la connexion à la base de données

Si l'API ne parvient pas à se connecter à la base de données, vérifiez les points suivants :

1. Assurez-vous que les secrets GitHub pour la base de données sont correctement configurés
2. Vérifiez que le serveur de base de données est accessible depuis le conteneur API
3. Consultez les logs de l'API pour voir les erreurs de connexion :
   ```bash
   docker logs torres-api
   ```
4. Testez la connexion à la base de données depuis le serveur :
   ```bash
   docker exec -it torres-api node -e "const sql = require('mssql'); sql.connect({user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, server: process.env.DB_HOST, port: parseInt(process.env.DB_PORT), options: {encrypt: true, trustServerCertificate: true}}).then(() => console.log('Connexion réussie')).catch(err => console.error('Erreur de connexion:', err))"
   ``` 