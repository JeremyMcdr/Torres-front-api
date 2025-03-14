#!/bin/bash

# Script pour déployer SQL Server dans un conteneur Docker

# Créer un réseau Docker pour la communication entre les conteneurs
docker network create torres-network || true

# Arrêter et supprimer le conteneur SQL Server s'il existe déjà
docker stop torres-sqlserver || true
docker rm torres-sqlserver || true

# Déployer SQL Server
docker run -d \
  --name torres-sqlserver \
  --network torres-network \
  --network nginx-proxy-manager_default \
  -e "ACCEPT_EULA=Y" \
  -e "SA_PASSWORD=Password123!" \
  -e "MSSQL_PID=Express" \
  -p 1433:1433 \
  --restart always \
  mcr.microsoft.com/mssql/server:2019-latest

# Attendre que SQL Server démarre
echo "Attente du démarrage de SQL Server..."
sleep 10

# Créer la base de données
docker exec -it torres-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "Password123!" \
  -Q "CREATE DATABASE TP_CSID"

echo "SQL Server est déployé et la base de données TP_CSID est créée."
echo "Informations de connexion :"
echo "Serveur : localhost,1433"
echo "Utilisateur : sa"
echo "Mot de passe : Password123!"
echo "Base de données : TP_CSID" 