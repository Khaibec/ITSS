# Script to start frontend dev server
Write-Host "Starting Frontend Dev Server..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Start dev server
Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:5175" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev

