# Outils de débogage pour Torres

Ce répertoire contient des outils pour faciliter le débogage de l'application Torres en local.

## Prérequis

- Docker et Docker Compose installés sur votre machine
- Git pour cloner le dépôt

## Utilisation

### Démarrer l'environnement de débogage

```bash
# Se placer dans le répertoire debug
cd debug

# Démarrer les conteneurs avec Docker Compose
docker-compose up
```

### Vérifier les logs

```bash
# Voir les logs de l'API
docker logs torres-api

# Voir les logs du frontend
docker logs torres-frontend

# Suivre les logs en temps réel
docker logs -f torres-api
docker logs -f torres-frontend
```

### Inspecter les conteneurs

```bash
# Voir l'état des conteneurs
docker ps -a | grep torres

# Inspecter un conteneur
docker inspect torres-api
docker inspect torres-frontend

# Vérifier les variables d'environnement dans un conteneur
docker exec torres-api env
docker exec torres-frontend env
```

### Exécuter des commandes dans les conteneurs

```bash
# Ouvrir un shell dans le conteneur API
docker exec -it torres-api sh

# Ouvrir un shell dans le conteneur frontend
docker exec -it torres-frontend sh
```

## Configuration Docker Hub

Pour utiliser Docker Hub avec les workflows GitHub Actions, vous devez configurer les secrets suivants dans votre dépôt GitHub :

- `DOCKERHUB_USERNAME` : Votre nom d'utilisateur Docker Hub
- `DOCKERHUB_PASSWORD` : Votre mot de passe Docker Hub

> **Note** : Pour des raisons de sécurité, il est recommandé de créer un utilisateur Docker Hub dédié avec des permissions limitées pour les déploiements automatisés.

## Résolution des problèmes courants

### Problème de connexion à la base de données

Si l'API ne peut pas se connecter à la base de données, vérifiez que :

1. Les variables d'environnement sont correctement définies
2. Le serveur de base de données est accessible depuis le conteneur
3. Les informations d'identification sont correctes

### Problème de démarrage des conteneurs

Si les conteneurs ne démarrent pas correctement :

1. Vérifiez les logs avec `docker logs torres-api` ou `docker logs torres-frontend`
2. Inspectez l'état du conteneur avec `docker inspect torres-api`
3. Vérifiez que les ports ne sont pas déjà utilisés sur votre machine

### Problème de communication entre les conteneurs

Si l'API et le frontend ne peuvent pas communiquer :

1. Vérifiez que les deux conteneurs sont sur le même réseau Docker
2. Vérifiez que le frontend est configuré pour utiliser le bon nom d'hôte pour l'API 