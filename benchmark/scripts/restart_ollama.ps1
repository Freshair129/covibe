# scripts/restart_ollama.ps1
# EABS-01 Compliance: Hard reset Ollama to clear VRAM fragmentation

$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$OllamaPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama app.exe"

Write-Host "🛑 Stopping Ollama processes..." -ForegroundColor Yellow
Stop-Process -Name "ollama app" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "ollama" -Force -ErrorAction SilentlyContinue

# Cooldown period for WDDM reclamation
Write-Host "💤 Waiting for VRAM reclamation (5s)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "🚀 Restarting Ollama..." -ForegroundColor Green
if (Test-Path $OllamaPath) {
    Start-Process -FilePath $OllamaPath
} else {
    Write-Error "Ollama not found at $OllamaPath"
    exit 1
}

Write-Host "⏳ Waiting for API readiness (11434)..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get
        if ($response) {
            Write-Host "✅ Ollama API is ready." -ForegroundColor Green
            $ready = $true
            break
        }
    } catch {
        # API not ready yet
    }
    Start-Sleep -Seconds 1
}

if (-not $ready) {
    Write-Error "Ollama failed to start within 30 seconds."
    exit 1
}
