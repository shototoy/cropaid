$ErrorActionPreference = "Stop"

Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location ..

Write-Host "Generating icon.ico..."
npm run icons:electron

Write-Host "Building portable app (release/CropAid-win32-x64)..."
npm run pack:win

$releaseDir = Join-Path (Get-Location) "release"
$appDir = Join-Path $releaseDir "CropAid-win32-x64"
$repoIcon = Join-Path (Get-Location) "icon.ico"
$releaseIcon = Join-Path $releaseDir "icon.ico"
$appIcon = Join-Path $appDir "icon.ico"

if (!(Test-Path $appDir)) {
  throw "Expected app folder missing: $appDir"
}
if (!(Test-Path $repoIcon)) {
  throw "Expected icon missing: $repoIcon"
}

Copy-Item -Force $repoIcon $releaseIcon
Copy-Item -Force $repoIcon $appIcon

$nsisRoot = Join-Path (Get-Location) "tools\\nsis\\nsis-3.10"
$makensis = Join-Path $nsisRoot "makensis.exe"

if (!(Test-Path $makensis)) {
  Write-Host "Downloading NSIS to tools/nsis..."
  $tools = Join-Path (Get-Location) "tools"
  New-Item -ItemType Directory -Force $tools | Out-Null

  $zip = Join-Path $tools "nsis.zip"
  $url = "https://downloads.sourceforge.net/project/nsis/NSIS%203/3.10/nsis-3.10.zip"
  & curl.exe -L -o $zip $url

  $dest = Join-Path $tools "nsis"
  if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
  Expand-Archive -Path $zip -DestinationPath $dest -Force
}

Write-Host "Compiling installer..."
& $makensis "installer\\CropAid.nsi" | Write-Host

$out = Join-Path $releaseDir "CropAid-Setup.exe"
if (!(Test-Path $out)) {
  throw "Installer build failed, missing: $out"
}

Write-Host "Syncing landing downloads..."
npm run landing:sync

Write-Host "Installer created: $out"
