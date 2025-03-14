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
- `DOCKERHUB_USERNAME` : Nom d'utilisateur Docker Hub
- `DOCKERHUB_PASSWORD` : Mot de passe Docker Hub
- `HOST` : Adresse IP ou nom d'hôte du serveur de déploiement
- `USERNAME` : Nom d'utilisateur SSH pour se connecter au serveur
- `PASSWORD` : Mot de passe SSH pour se connecter au serveur
- `PORT` : Port SSH du serveur (généralement 22)

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

## Vérification du déploiement

Une fois déployée, l'application est accessible :
- Front-end : http://votre-serveur:8080
- API : http://votre-serveur:3000

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