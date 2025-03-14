# Dashboard Torres

Dashboard d'analyse de données commerciales basé sur une base de données en étoile SQL Server.

## Structure du projet

Le projet est divisé en deux parties principales :

- **api** : Backend Node.js avec Express qui se connecte à la base de données SQL Server
- **front** : Frontend React qui affiche les données sous forme de tableaux de bord

## Prérequis

- Node.js 20.x ou supérieur
- npm 10.x ou supérieur
- SQL Server (accessible à distance)
- PM2 (pour le déploiement en production)

## Installation et démarrage en développement

### API

```bash
cd api
npm install
npm start
```

L'API sera accessible à l'adresse http://localhost:3001

### Frontend

```bash
cd front
npm install
npm start
```

Le frontend sera accessible à l'adresse http://localhost:3000

## Déploiement

### Déploiement local avec PM2

Un script PowerShell est fourni pour faciliter le déploiement local avec PM2 :

```powershell
./deploy.ps1
```

Ce script va :
1. Installer les dépendances de l'API et du frontend
2. Construire le frontend
3. Démarrer l'API et le frontend avec PM2

### Déploiement sur un serveur distant

Un script PowerShell est fourni pour déployer l'application sur un serveur distant :

```powershell
./deploy-remote.ps1 -Host "votre-serveur.com" -Username "utilisateur" -Password "votre-mot-de-passe" -RemotePath "/var/www/torres"
```

Ou avec une clé SSH (optionnel) :

```powershell
./deploy-remote.ps1 -Host "votre-serveur.com" -Username "utilisateur" -Password "votre-mot-de-passe" -KeyFile "chemin/vers/cle.pem" -RemotePath "/var/www/torres"
```

### Déploiement automatique avec GitHub Actions

Le projet est configuré pour utiliser GitHub Actions pour le déploiement automatique :

1. Configurez les secrets suivants dans votre dépôt GitHub :
   - `HOST` : Adresse du serveur
   - `USERNAME` : Nom d'utilisateur SSH
   - `PASSWORD` : Mot de passe pour l'authentification
   - `PORT` : Port SSH (généralement 22)

2. Poussez vos modifications sur la branche `main` ou `master`

3. GitHub Actions déploiera automatiquement l'API et le frontend sur votre serveur

## Configuration

### Variables d'environnement de l'API

Créez un fichier `.env` dans le répertoire `api` avec les variables suivantes :

```
DB_SERVER=159.203.139.99,1433
DB_USER=sa
DB_PASSWORD=votre-mot-de-passe
DB_DATABASE=TP_CSID
PORT=3001
```

### Configuration du frontend

Le frontend est configuré pour se connecter à l'API à l'adresse `http://localhost:3001/api`. Si vous souhaitez modifier cette URL, modifiez la variable `API_URL` dans le fichier `front/src/services/api.js`.

## Fonctionnalités

Le dashboard permet de visualiser les indicateurs suivants :

1. Chiffre d'affaires par pays et par année
2. Chiffre d'affaires par commercial et par année
3. Taux de réussite des commerciaux
4. Pourcentage de commandes par motif
5. Objectifs commerciaux et leur taux de complétion
6. Projection du chiffre d'affaires pour l'année en cours 