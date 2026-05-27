$ErrorActionPreference = "Stop"

Write-Host "== Pushing local changes to GitHub =="
git status

Write-Host ""
Write-Host "Now commit and push manually if needed:"
Write-Host "git add ."
Write-Host "git commit -m `"Update CV assistant`""
Write-Host "git push"
Write-Host ""

$confirm = Read-Host "Have you already pushed changes to GitHub? Type YES to deploy backend"

if ($confirm -ne "YES") {
  Write-Host "Deploy cancelled."
  exit 1
}

Write-Host "== Deploying backend on DO server =="
ssh artem@100.116.164.32 "sudo /usr/local/bin/deploy-cv-assistant"

Write-Host "== Checking public health endpoint =="
Invoke-RestMethod -Uri "https://cv-api-209-38-212-226.sslip.io/health" -Method GET

Write-Host "== Done =="