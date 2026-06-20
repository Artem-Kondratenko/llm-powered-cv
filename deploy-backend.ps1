$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ServerSsh = "artem@100.116.164.32"
$RemoteDeployCommand = "sudo /usr/local/bin/deploy-cv-assistant"
$HealthUrl = "https://cv-api-209-38-212-226.sslip.io/health"
$ChatUrl = "https://cv-api-209-38-212-226.sslip.io/api/cv-assistant/chat"
$TestQuestion = "Сколько лет Артёму?"

function Invoke-Native {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command,

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  & $Command @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $Command $($Arguments -join ' ')"
  }
}

function Invoke-GitOutput {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  $output = & git @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw "Git command failed: git $($Arguments -join ' ')"
  }

  return $output
}

function Assert-GitRepository {
  $repoRoot = (Invoke-GitOutput rev-parse --show-toplevel | Select-Object -First 1)

  if (-not $repoRoot) {
    throw "Current folder is not inside a git repository."
  }

  Set-Location $repoRoot
  Write-Host "== Repository =="
  Write-Host $repoRoot
  Write-Host ""
}

function Assert-CleanWorktree {
  Write-Host "== Checking local git changes =="

  $rawStatus = & git status --porcelain

  if ($LASTEXITCODE -ne 0) {
    throw "Git command failed: git status --porcelain"
  }

  $status = @($rawStatus | Where-Object { $_ })

  if ($status.Count -gt 0) {
    Write-Host "Local changes were found. Commit and push them before deploying:"
    Write-Host ""
    git status --short
    Write-Host ""
    Write-Host "Suggested flow:"
    Write-Host "git add ."
    Write-Host "git commit -m `"Update CV assistant`""
    Write-Host ".\deploy-backend.ps1"
    throw "Deploy stopped: local changes are not committed."
  }

  Write-Host "Worktree is clean."
  Write-Host ""
}

function Sync-CurrentBranch {
  Write-Host "== Checking current branch sync =="

  $branch = (Invoke-GitOutput rev-parse --abbrev-ref HEAD | Select-Object -First 1)

  if ($branch -eq "HEAD") {
    throw "Deploy stopped: repository is in detached HEAD state."
  }

  $upstreamRef = "HEAD@{upstream}"
  $upstreamOutput = & git rev-parse --abbrev-ref $upstreamRef 2>$null
  $upstreamExitCode = $LASTEXITCODE
  $upstreamLines = @($upstreamOutput | Where-Object { $_ })
  $upstream = if ($upstreamLines.Count -gt 0) { [string]$upstreamLines[0] } else { "" }

  if ($upstreamExitCode -ne 0 -or -not $upstream) {
    Write-Host "Branch '$branch' has no upstream configured."
    Write-Host "Run this once, then start deploy again:"
    Write-Host "git push -u origin $branch"
    Write-Host ""
    Write-Host "Debug info:"
    git branch -vv
    throw "Deploy stopped: upstream is not configured."
  }

  Write-Host "Branch:   $branch"
  Write-Host "Upstream: $upstream"
  Write-Host ""

  Invoke-Native git fetch --prune

  $countsLine = (Invoke-GitOutput rev-list --left-right --count "$upstream...HEAD" | Select-Object -First 1)
  $counts = $countsLine -split "\s+"
  $behind = [int]$counts[0]
  $ahead = [int]$counts[1]

  if ($behind -gt 0) {
    Write-Host "Local branch is behind '$upstream' by $behind commit(s)."
    Write-Host "Pull/rebase first, resolve possible conflicts, then deploy again."
    throw "Deploy stopped: local branch is behind upstream."
  }

  if ($ahead -gt 0) {
    Write-Host "Local branch has $ahead commit(s) not pushed to '$upstream'."
    $confirmPush = Read-Host "Push them now? Type YES to push"

    if ($confirmPush -ne "YES") {
      throw "Deploy stopped: commits are not pushed."
    }

    Invoke-Native git push
    Write-Host ""
  }

  Write-Host "Branch is synced with upstream."
  Write-Host ""
}

function Invoke-RemoteDeploy {
  Write-Host "== Deploying backend on DO server =="
  Write-Host "$ServerSsh -> $RemoteDeployCommand"
  Write-Host ""

  Invoke-Native ssh -tt $ServerSsh $RemoteDeployCommand

  Write-Host ""
}

function Test-PublicHealth {
  Write-Host "== Checking public health endpoint =="

  $health = Invoke-RestMethod -Uri $HealthUrl -Method GET
  $health | ConvertTo-Json -Depth 5

  Write-Host ""
}

function Test-AssistantChat {
  Write-Host "== Checking assistant chat endpoint =="
  Write-Host "Question: $TestQuestion"

  $body = @{
    message = $TestQuestion
    history = @()
  } | ConvertTo-Json -Depth 5

  $answer = Invoke-RestMethod -Uri $ChatUrl -Method POST -ContentType "application/json; charset=utf-8" -Body $body
  $answer | ConvertTo-Json -Depth 10

  Write-Host ""
}

Write-Host "== CV Assistant backend deploy =="
Write-Host ""

Assert-GitRepository
Assert-CleanWorktree
Sync-CurrentBranch
Invoke-RemoteDeploy
Test-PublicHealth
Test-AssistantChat

Write-Host "== Done =="
