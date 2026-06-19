# setup-node.ps1
# Setup script to download and extract portable Node.js 22.12.0 Windows x64

$workspace = "c:\Users\Dell\Desktop\ANTIGRAVITY"
$nodeDir = "$workspace\node"
$zipPath = "$nodeDir\node.zip"
$tempExtractDir = "$nodeDir\temp_extract"

Write-Host "Creating node directory at $nodeDir..."
if (-not (Test-Path $nodeDir)) {
    New-Item -ItemType Directory -Path $nodeDir -Force | Out-Null
}

Write-Host "Downloading Node.js 22.12.0 LTS..."
# We use curl.exe directly as it handles SSL/TLS and redirects very reliably on Windows
curl.exe -L "https://nodejs.org/dist/v22.12.0/node-v22.12.0-win-x64.zip" -o $zipPath

Write-Host "Extracting zip file..."
if (Test-Path $tempExtractDir) {
    Remove-Item -Recurse -Force $tempExtractDir | Out-Null
}
New-Item -ItemType Directory -Path $tempExtractDir -Force | Out-Null
Expand-Archive -Path $zipPath -DestinationPath $tempExtractDir -Force

Write-Host "Moving extracted files to node directory..."
# The extracted files are inside a subfolder named node-v22.12.0-win-x64
$extractedSubfolder = Get-ChildItem -Path $tempExtractDir -Directory | Select-Object -First 1

if ($extractedSubfolder) {
    # Copy all files from the subfolder directly to $nodeDir
    Get-ChildItem -Path $extractedSubfolder.FullName | ForEach-Object {
        Move-Item -Path $_.FullName -Destination $nodeDir -Force
    }
}

Write-Host "Cleaning up temporary zip and extraction folders..."
Remove-Item -Path $zipPath -Force
Remove-Item -Recurse -Force $tempExtractDir

Write-Host "Node.js portable installation complete!"
& "$nodeDir\node.exe" -v
& "$nodeDir\npm.cmd" -v
