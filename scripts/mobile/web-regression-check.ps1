# Axivon Technologies — Web Regression Check (PowerShell Wrapper)
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "                  AXIVON WEB REGRESSION GATE (WINDOWS / PS)                     " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

Write-Host "`nStep 1: Running UI Error System Guardrails..." -ForegroundColor Yellow
npm run check:errors
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error guard check failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`nStep 2: Executing Two-Pass Web Regression Runner (Flag OFF & Flag ON)..." -ForegroundColor Yellow
node scripts/mobile/web-regression-check.mjs
$runnerExitCode = $LASTEXITCODE

if ($runnerExitCode -eq 0) {
    Write-Host "`n✅ WEB REGRESSION GATE PASSED! Safe to merge." -ForegroundColor Green
} else {
    Write-Host "`n❌ REGRESSION GATE FAILED. Please review the table above." -ForegroundColor Red
}

exit $runnerExitCode
