# build-deployment-zip.ps1
# Automates compiling and zipping the frontend & backend for Hostinger upload.

$workspace = "c:\Users\Dell\Desktop\ANTIGRAVITY"
$deployDir = "$workspace\deploy_bundle"
$zipPath = "$workspace\deploy.zip"

# Pre-clean
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir | Out-Null
}
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath | Out-Null
}

Write-Host "Creating deployment directory..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
New-Item -ItemType Directory -Path "$deployDir\backend" -Force | Out-Null
New-Item -ItemType Directory -Path "$deployDir\frontend" -Force | Out-Null

# Setup PATH for portable node
$env:PATH = "$workspace\node;$env:PATH"

# 1. Build Backend
Write-Host "Preparing Backend..." -ForegroundColor Cyan
cd "$workspace\backend"
npm install
npx prisma generate

# Copy backend files (excluding node_modules)
Copy-Item -Path "server.js", "package.json", "package-lock.json" -Destination "$deployDir\backend"
Copy-Item -Path "src" -Destination "$deployDir\backend\src" -Recurse
Copy-Item -Path "prisma" -Destination "$deployDir\backend\prisma" -Recurse

# 2. Build Frontend
Write-Host "Building Frontend..." -ForegroundColor Cyan
cd "$workspace\frontend"
npm install
$env:NEXT_PUBLIC_API_URL = "http://localhost:5000/api/v1" # Replace with your production API URL
npx next build --webpack


# Copy frontend production files
Copy-Item -Path "package.json", "package-lock.json", "next.config.ts" -Destination "$deployDir\frontend"
Copy-Item -Path "public" -Destination "$deployDir\frontend\public" -Recurse
Copy-Item -Path ".next" -Destination "$deployDir\frontend\.next" -Recurse

# 3. Copy root configs
Copy-Item -Path "$workspace\ecosystem.config.cjs", "$workspace\nginx.conf" -Destination $deployDir

# 4. Compress to Zip
Write-Host "Creating deploy.zip archive..." -ForegroundColor Green
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipPath -Force

# Clean up deploy folder
Remove-Item -Recurse -Force $deployDir | Out-Null

Write-Host "SUCCESS! Deployment package created at $zipPath" -ForegroundColor Green
Write-Host "You can upload this zip file directly to Hostinger's File Manager and extract it." -ForegroundColor Yellow
