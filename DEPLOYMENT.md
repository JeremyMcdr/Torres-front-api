# Guide de déploiement de l'application Torres

Ce document explique comment l'application Torres est déployée automatiquement via GitHub Actions.

## Architecture

L'application est composée de trois parties principales :
- **API** : Une API Node.js (Express) exposée sur le port 3000
- **FRONT** : Une application React servie par Nginx sur le port 8080
- **SQL Server** : Une base de données SQL Server exposée sur le port 1433

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

## Configuration réseau Docker

L'application utilise deux réseaux Docker :
- **torres-network** : Réseau interne pour la communication entre l'API, le FRONT et SQL Server
- **nginx-proxy-manager_default** : Réseau externe pour la communication avec Nginx Proxy Manager

Cette configuration permet au reverse proxy d'accéder directement aux conteneurs par leur nom, sans passer par l'interface réseau externe du serveur.

### Configuration du reverse proxy

Le reverse proxy (Nginx Proxy Manager) doit être configuré pour pointer vers :
- **Front-end** : torres-front:80
- **API** : torres-api:3000

## Base de données SQL Server

L'application utilise SQL Server comme base de données. Un conteneur Docker est automatiquement créé lors du déploiement avec les paramètres suivants :

- **Nom du conteneur** : torres-sqlserver
- **Port** : 1433
- **Utilisateur** : sa
- **Mot de passe** : Password123!
- **Base de données** : TP_CSID

Les données sont persistantes grâce à un volume Docker nommé `sqlserver-data`.

## Déploiement manuel

Si vous souhaitez déployer manuellement l'application, suivez ces étapes :

1. Clonez le dépôt sur votre serveur :
   ```bash
   git clone <URL_DU_REPO> torres-app
   cd torres-app
   ```

2. Déployez avec Docker Compose :
   ```bash
   docker-compose up -d
   ```

3. Connectez les conteneurs au réseau du reverse proxy :
   ```bash
   docker network connect nginx-proxy-manager_default torres-api
   docker network connect nginx-proxy-manager_default torres-front
   docker network connect nginx-proxy-manager_default torres-sqlserver
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

# Logs de SQL Server
docker logs torres-sqlserver

# Logs de tous les conteneurs
docker-compose logs
```

### Accès à la base de données

Pour accéder à la base de données SQL Server :
```bash
# Se connecter à SQL Server
docker exec -it torres-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Password123!"

# Exécuter des requêtes SQL
1> USE TP_CSID;
2> GO
1> SELECT * FROM information_schema.tables;
2> GO
```

### Sauvegarde de la base de données

Pour sauvegarder la base de données :
```bash
# Créer un répertoire pour les sauvegardes
mkdir -p ~/torres-app/backups

# Sauvegarder la base de données
docker exec -it torres-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "Password123!" \
  -Q "BACKUP DATABASE TP_CSID TO DISK = N'/var/opt/mssql/backup/TP_CSID_$(date +%Y%m%d_%H%M%S).bak' WITH NOFORMAT, NOINIT, NAME = 'TP_CSID-Full Database Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10"

# Copier la sauvegarde sur le serveur hôte
docker cp torres-sqlserver:/var/opt/mssql/backup/ ~/torres-app/backups/
```

### Dépannage de la connexion à la base de données

Si l'API ne parvient pas à se connecter à la base de données, vérifiez les points suivants :

1. Vérifiez que le conteneur SQL Server est en cours d'exécution :
   ```bash
   docker ps | grep torres-sqlserver
   ```

2. Vérifiez les logs de SQL Server :
   ```bash
   docker logs torres-sqlserver
   ```

3. Testez la connexion à la base de données depuis le serveur :
   ```bash
   docker exec -it torres-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Password123!" -Q "SELECT @@VERSION"
   ```

4. Vérifiez que les conteneurs sont sur le même réseau Docker :
   ```bash
   docker network inspect torres-network
   docker network inspect nginx-proxy-manager_default
   ``` 