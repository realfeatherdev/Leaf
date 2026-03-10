# if ($env:PATH) {
#     Remove-Item Env:\Path -ErrorAction SilentlyContinue
# }


# watch-rollup.ps1
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$srcPath = Join-Path $projectRoot "src"
$bannerFile = Join-Path $projectRoot "banner.js"
$interval = 500  # milliseconds between checks

# Get initial modification times
function Get-FileTimes($paths) {
    $fileTimes = @{}
    foreach ($path in $paths) {
        if (Test-Path $path) {
            Get-ChildItem -Path $path -Recurse -File | ForEach-Object {
                $fileTimes[$_.FullName] = $_.LastWriteTime
            }
        }
    }
    return $fileTimes
}

$watchedPaths = @($srcPath, $bannerFile)
$lastTimes = Get-FileTimes $watchedPaths

Write-Host "Watching src/**/*.js and banner.js for changes..." -ForegroundColor Green

while ($true) {
    Start-Sleep -Milliseconds $interval
    $currentTimes = Get-FileTimes $watchedPaths
    $changed = $false

    foreach ($file in $currentTimes.Keys) {
        if (-not $lastTimes.ContainsKey($file) -or $currentTimes[$file] -ne $lastTimes[$file]) {
            Write-Host "`nChange detected in $file, rebuilding..." -ForegroundColor Yellow
            $changed = $true
            break
        }
    }

    if ($changed) {
        # Run Rollup
        $rollupProcess = Start-Process -NoNewWindow -PassThru -FilePath "cmd.exe" -ArgumentList '/c npx rollup -c'
        # $rollupProcess = Start-Process -NoNewWindow -PassThru -FilePath "npx" -ArgumentList "rollup -c"

        $rollupProcess.WaitForExit()

        # Update last modified times
        $lastTimes = Get-FileTimes $watchedPaths
    }
}
