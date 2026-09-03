# sync-watch.ps1
# Watches admin-web source directories and auto-syncs to customer-web and partner-web.
# Run this in a separate terminal while developing.

$base     = Split-Path -Parent $MyInvocation.MyCommand.Definition
$src      = "$base\admin-web\src"
$targets  = @("$base\customer-web\src", "$base\partner-web\src")
$dirs     = @("components\admin", "lib", "context", "app\admin")
$interval = 2

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  VINGT TRIOS - Auto Sync Watcher" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Source   : admin-web/src" -ForegroundColor Yellow
Write-Host "  Targets  : customer-web/src, partner-web/src" -ForegroundColor Yellow
Write-Host "  Watching : components/admin, lib, context, app/admin" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Initial full sync
Write-Host "Running initial sync..." -ForegroundColor DarkGray
foreach ($dir in $dirs) {
    foreach ($target in $targets) {
        robocopy "$src\$dir" "$target\$dir" /mir /ndl /nfl /njh /njs /ns /nc /np 2>$null | Out-Null
    }
}
Write-Host "Initial sync complete." -ForegroundColor Green
Write-Host ""

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $src
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$script:pending = $false
$onChange = { $script:pending = $true }
Register-ObjectEvent $watcher Changed -Action $onChange | Out-Null
Register-ObjectEvent $watcher Created -Action $onChange | Out-Null
Register-ObjectEvent $watcher Deleted -Action $onChange | Out-Null
Register-ObjectEvent $watcher Renamed -Action $onChange | Out-Null

Write-Host "Watching for changes in admin-web/src..." -ForegroundColor Cyan
Write-Host ""

while ($true) {
    Start-Sleep -Seconds $interval
    if ($script:pending) {
        $script:pending = $false
        $stamp = (Get-Date).ToString("HH:mm:ss")
        Write-Host "[$stamp] Change detected - syncing..." -ForegroundColor DarkYellow
        foreach ($dir in $dirs) {
            foreach ($target in $targets) {
                robocopy "$src\$dir" "$target\$dir" /mir /ndl /njh /njs /ns /nc /np 2>$null | Out-Null
            }
        }
        Write-Host "[$stamp] Synced to customer-web and partner-web" -ForegroundColor Green
    }
}
