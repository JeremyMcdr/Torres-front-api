# Script de déploiement distant pour l'application Torres
# Ce script permet de déployer l'API et le frontend sur un serveur distant

param (
    [Parameter(Mandatory=$true)]
    [string]$Host,
    
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [Parameter(Mandatory=$false)]
    [string]$KeyFile,
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 22,
    
    [Parameter(Mandatory=$false)]
    [string]$RemotePath = "/var/www/torres"
)

Write-Host "Déploiement distant de l'application Torres" -ForegroundColor Green
Write-Host "Serveur: $Host" -ForegroundColor Cyan
Write-Host "Utilisateur: $Username" -ForegroundColor Cyan
Write-Host "Chemin distant: $RemotePath" -ForegroundColor Cyan

# Vérifier si sshpass est installé pour l'authentification par mot de passe
$useSshpass = $false
try {
    $sshpassVersion = sshpass -V
    $useSshpass = $true
    Write-Host "Utilisation de sshpass pour l'authentification par mot de passe" -ForegroundColor Yellow
}
catch {
    Write-Host "sshpass n'est pas installé. Installation en cours..." -ForegroundColor Yellow
    
    # Détection du système d'exploitation
    if ($IsLinux) {
        sudo apt-get install -y sshpass
    }
    elseif ($IsMacOS) {
        brew install hudochenkov/sshpass/sshpass
    }
    else {
        Write-Host "Impossible d'installer sshpass automatiquement sur Windows." -ForegroundColor Red
        Write-Host "Veuillez l'installer manuellement ou utiliser une clé SSH." -ForegroundColor Red
        
        if ([string]::IsNullOrEmpty($KeyFile)) {
            Write-Host "Veuillez spécifier un fichier de clé SSH avec -KeyFile" -ForegroundColor Red
            exit 1
        }
    }
    
    # Vérifier si l'installation a réussi
    try {
        $sshpassVersion = sshpass -V
        $useSshpass = $true
        Write-Host "sshpass installé avec succès" -ForegroundColor Green
    }
    catch {
        Write-Host "L'installation de sshpass a échoué" -ForegroundColor Red
        if ([string]::IsNullOrEmpty($KeyFile)) {
            Write-Host "Veuillez spécifier un fichier de clé SSH avec -KeyFile" -ForegroundColor Red
            exit 1
        }
    }
}

# Construire le frontend
Write-Host "`nConstruction du frontend..." -ForegroundColor Green
Set-Location -Path ".\front"
npm install
npm run build
Set-Location -Path ".."

# Préparer les commandes SSH
$sshOptions = "-p $Port"
if (-not [string]::IsNullOrEmpty($KeyFile)) {
    $sshOptions += " -i `"$KeyFile`""
}

$sshCommand = "ssh $sshOptions $Username@$Host"
if ($useSshpass) {
    $sshCommand = "sshpass -p `"$Password`" $sshCommand"
}

$scpOptions = "-P $Port"
if (-not [string]::IsNullOrEmpty($KeyFile)) {
    $scpOptions += " -i `"$KeyFile`""
}

$scpCommand = "scp $scpOptions"
if ($useSshpass) {
    $scpCommand = "sshpass -p `"$Password`" $scpCommand"
}

# Créer le répertoire distant si nécessaire
Write-Host "`nCréation des répertoires distants..." -ForegroundColor Green
Invoke-Expression "$sshCommand 'mkdir -p $RemotePath/api $RemotePath/front/build'"

# Déployer l'API
Write-Host "`nDéploiement de l'API..." -ForegroundColor Green
Invoke-Expression "$scpCommand -r api/* $Username@$Host`:$RemotePath/api/"

# Déployer le frontend
Write-Host "`nDéploiement du frontend..." -ForegroundColor Green
Invoke-Expression "$scpCommand -r front/build/* $Username@$Host`:$RemotePath/front/build/"

# Installer les dépendances et démarrer les services
Write-Host "`nInstallation des dépendances et démarrage des services..." -ForegroundColor Green
$remoteCommands = @"
cd $RemotePath/api
npm install
pm2 delete api 2>/dev/null || true
pm2 start index.js --name api --port 3001

cd $RemotePath/front
pm2 delete front 2>/dev/null || true
pm2 serve build 3000 --name front --spa

pm2 save
"@

Invoke-Expression "$sshCommand '$remoteCommands'"

Write-Host "`nDéploiement distant terminé !" -ForegroundColor Green
Write-Host "API: http://$Host:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://$Host:3000" -ForegroundColor Cyan 