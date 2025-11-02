# PowerShell script for starting development server
$env:EXPO_PUBLIC_ENVIRONMENT = "development"
Write-Host "🚀 Starting SwiftCab Driver App in DEVELOPMENT mode..." -ForegroundColor Green
Write-Host "Environment: $env:EXPO_PUBLIC_ENVIRONMENT" -ForegroundColor Yellow
expo start
