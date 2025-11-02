# PowerShell script for starting production server
$env:EXPO_PUBLIC_ENVIRONMENT = "production"
Write-Host "🚀 Starting SwiftCab Driver App in PRODUCTION mode..." -ForegroundColor Green
Write-Host "Environment: $env:EXPO_PUBLIC_ENVIRONMENT" -ForegroundColor Yellow
expo start
