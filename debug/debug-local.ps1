# Script de débogage local pour l'application Torres
# Ce script permet de démarrer les conteneurs Docker pour le débogage

Write-Host "Démarrage de l'environnement de débogage Torres" -ForegroundColor Green

# Vérifier si Docker est installé
try {
    $dockerVersion = docker --version
    Write-Host "Docker version: $dockerVersion" -ForegroundColor Cyan
}
catch {
    Write-Host "Docker n'est pas installé. Veuillez l'installer avant de continuer." -ForegroundColor Red
    exit 1
}

# Vérifier si Docker Compose est installé
try {
    $dockerComposeVersion = docker-compose --version
    Write-Host "Docker Compose version: $dockerComposeVersion" -ForegroundColor Cyan
}
catch {
    Write-Host "Docker Compose n'est pas installé. Veuillez l'installer avant de continuer." -ForegroundColor Red
    exit 1
}

# Arrêter les conteneurs existants
Write-Host "`nArrêt des conteneurs existants..." -ForegroundColor Yellow
docker stop torres-api torres-frontend 2>$null
docker rm torres-api torres-frontend 2>$null

# Créer le Dockerfile.dev pour le frontend
Write-Host "`nCréation du Dockerfile.dev pour le frontend..." -ForegroundColor Cyan
$frontendDockerfilePath = "../FRONT/Dockerfile.dev"
@"
FROM node:20-alpine

WORKDIR /app

# Installer les dépendances de débogage
RUN apk add --no-cache curl nano

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Exposer le port
EXPOSE 3000

# Démarrer le serveur de développement
ENV CI=false
CMD ["npm", "start"]
"@ | Out-File -FilePath $frontendDockerfilePath -Encoding utf8

# Démarrer les conteneurs avec Docker Compose
Write-Host "`nDémarrage des conteneurs..." -ForegroundColor Green
docker-compose up -d

# Afficher les logs
Write-Host "`nAffichage des logs de l'API..." -ForegroundColor Cyan
docker logs torres-api

Write-Host "`nAffichage des logs du frontend..." -ForegroundColor Cyan
docker logs torres-frontend

# Afficher les informations de débogage
Write-Host "`nInformations de débogage:" -ForegroundColor Green
Write-Host "API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nCommandes utiles:" -ForegroundColor Yellow
Write-Host "docker logs -f torres-api     # Suivre les logs de l'API" -ForegroundColor White
Write-Host "docker logs -f torres-frontend # Suivre les logs du frontend" -ForegroundColor White
Write-Host "docker exec -it torres-api sh  # Ouvrir un shell dans le conteneur API" -ForegroundColor White
Write-Host "docker exec -it torres-frontend sh # Ouvrir un shell dans le conteneur frontend" -ForegroundColor White
Write-Host "docker-compose down           # Arrêter tous les conteneurs" -ForegroundColor White 