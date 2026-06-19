# run.ps1
# Helper script to execute commands using the portable Node.js version.
param(
    [Parameter(Mandatory=$true, ValueFromRemainingArguments=$true)]
    [string[]]$Command
)

$workspace = "c:\Users\Dell\Desktop\ANTIGRAVITY"
$nodeDir = "$workspace\node"

# Update PATH for this process only to prepend the portable node directory
$env:PATH = "$nodeDir;$env:PATH"

# Run the command
$commandString = $Command -join " "
Write-Host "Running: $commandString" -ForegroundColor Cyan
Invoke-Expression $commandString
