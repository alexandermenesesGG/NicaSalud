$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$webRoot = $projectRoot
$port = 8000
$serverHost = '127.0.0.1'

$phpCandidates = @(
    'php',
    'C:\xampp\php\php.exe',
    'C:\wamp64\bin\php\php.exe',
    'C:\laragon\bin\php\php.exe',
    'C:\Program Files\php\php.exe',
    'C:\Program Files (x86)\PHP\php.exe'
)

$phpExe = $null
foreach ($candidate in $phpCandidates) {
    if ($candidate -eq 'php') {
        $cmd = Get-Command php -ErrorAction SilentlyContinue
        if ($cmd) {
            $phpExe = $cmd.Source
            break
        }
        continue
    }

    if (Test-Path $candidate) {
        $phpExe = $candidate
        break
    }
}

if (-not $phpExe) {
    Write-Host 'No se encontro PHP en este equipo.'
    Write-Host 'Instala PHP 8+ o XAMPP y vuelve a ejecutar este script.'
    Write-Host 'Ruta esperada del servidor: http://127.0.0.1:8000/'
    exit 1
}

if (-not $env:DB_HOST) { $env:DB_HOST = '127.0.0.1' }
if (-not $env:DB_PORT) { $env:DB_PORT = '3306' }
if (-not $env:DB_USER) { $env:DB_USER = 'root' }
if (-not $env:DB_PASSWORD) { $env:DB_PASSWORD = '' }
if (-not $env:DB_NAME) { $env:DB_NAME = 'nicasalud_contactos' }

Write-Host "Usando PHP en: $phpExe"
Write-Host "Sirviendo desde: $webRoot"
Write-Host "Abre: http://$serverHost`:$port/"

& $phpExe -S "$serverHost`:$port" -t $webRoot
