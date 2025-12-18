# PetPal - Clean Startup Script
# This script kills all Node processes and starts both servers cleanly

Write-Host "🔄 Stopping all Node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe /T 2>$null
Start-Sleep -Seconds 2

Write-Host "✅ Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Subbareddybhavanam\Desktop\pet-frontend-backend\backend'; npm run dev"
Start-Sleep -Seconds 5

Write-Host "✅ Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Subbareddybhavanam\Desktop\pet-frontend-backend'; npm run dev"

Write-Host ""
Write-Host "🎉 Both servers are starting!" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
