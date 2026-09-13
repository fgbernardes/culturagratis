param(
  [ValidatePattern("^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")]
  [string]$WorkerName = "cgl-independente-teste"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

function Invoke-NativeChecked {
  param(
    [Parameter(Mandatory = $true)][string]$FilePath,
    [string[]]$ArgumentList = @()
  )

  & $FilePath @ArgumentList
  $exitCode = $LASTEXITCODE
  if ($null -eq $exitCode -or $exitCode -ne 0) {
    throw "Command failed with exit code $exitCode`: $FilePath $($ArgumentList -join ' ')"
  }
}

function Assert-WorkersDevOnlySourceConfig {
  param([Parameter(Mandatory = $true)][string]$Path)

  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "Missing Wrangler configuration: $Path"
  }

  $configText = Get-Content -LiteralPath $Path -Raw
  $approvedRoute = '"pattern"\s*:\s*"www\\.culturagratis\\.com"\s*,\s*"zone_name"\s*:\s*"culturagratis\\.com"\s*,\s*"custom_domain"\s*:\s*true'
  if ($configText -match '"route"\s*:' -or ($configText -match '"routes"\s*:' -and $configText -notmatch $approvedRoute)) {
    throw "Publication interrupted: only the approved www.culturagratis.com custom-domain route may be configured in $Path."
  }
  if ($configText -notmatch '"workers_dev"\s*:\s*true') {
    throw "Publication interrupted: workers_dev must be explicitly true in $Path."
  }
}

function Get-VerifiedHttpStatus {
  param([Parameter(Mandatory = $true)][string]$Uri)

  $lastFailure = $null
  for ($attempt = 1; $attempt -le 6; $attempt++) {
    try {
      $response = Invoke-WebRequest -Uri $Uri -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 30
      if ($response.StatusCode -eq 200) {
        return [int]$response.StatusCode
      }
      $lastFailure = "HTTP $($response.StatusCode)"
    }
    catch {
      $lastFailure = $_.Exception.Message
    }

    if ($attempt -lt 6) {
      Start-Sleep -Seconds 3
    }
  }

  throw "HTTP verification failed for $Uri`: $lastFailure"
}

if (Test-Path -LiteralPath ".openai/hosting.json" -PathType Leaf) {
  throw "Publication interrupted: this package cannot contain ChatGPT Sites configuration."
}

Assert-WorkersDevOnlySourceConfig -Path "wrangler.jsonc"

$nodeCommand = Get-Command "node.exe" -ErrorAction Stop
$nodeExe = $nodeCommand.Source
$nodeDirectory = Split-Path -Parent $nodeExe
$npmCmd = Join-Path $nodeDirectory "npm.cmd"

if (-not (Test-Path -LiteralPath $npmCmd -PathType Leaf)) {
  throw "npm.cmd was not found next to node.exe: $npmCmd"
}

Write-Host "Node executable: $nodeExe"
Write-Host "Exclusive deployment target: $WorkerName on workers.dev"

if (Test-Path -LiteralPath ".wrangler/deploy") {
  Remove-Item -LiteralPath ".wrangler/deploy" -Recurse -Force
}
if (Test-Path -LiteralPath "dist") {
  Remove-Item -LiteralPath "dist" -Recurse -Force
}

Invoke-NativeChecked -FilePath $npmCmd -ArgumentList @("ci")
Invoke-NativeChecked -FilePath $npmCmd -ArgumentList @("test")

$wranglerCli = Join-Path $PSScriptRoot "node_modules/wrangler/bin/wrangler.js"
$artifactValidator = Join-Path $PSScriptRoot "scripts/validate-artifact.mjs"
if (-not (Test-Path -LiteralPath $wranglerCli -PathType Leaf)) {
  throw "Wrangler CLI was not installed: $wranglerCli"
}

Invoke-NativeChecked -FilePath $nodeExe -ArgumentList @($artifactValidator)
Invoke-NativeChecked -FilePath $nodeExe -ArgumentList @($wranglerCli, "whoami")

$deployLines = New-Object System.Collections.Generic.List[string]
& $nodeExe $wranglerCli "deploy" "--name" $WorkerName 2>&1 | ForEach-Object {
  $line = $_.ToString()
  Write-Host $line
  [void]$deployLines.Add($line)
}
$deployExitCode = $LASTEXITCODE
if ($null -eq $deployExitCode -or $deployExitCode -ne 0) {
  throw "Wrangler deploy failed with exit code $deployExitCode."
}

$deployText = $deployLines -join "`n"
$ansiPattern = "$([char]27)\[[0-?]*[ -/]*[@-~]"
$plainDeployText = [regex]::Replace($deployText, $ansiPattern, "")
$triggerMatches = [regex]::Matches($plainDeployText, '(?m)^\s*(https://[^\s]+)\s*$')
$triggerUrls = @($triggerMatches | ForEach-Object { $_.Groups[1].Value.TrimEnd('/') })
$approvedPublicUrl = "https://www.culturagratis.com"
$unexpectedUrls = @($triggerUrls | Where-Object { $_ -ne $approvedPublicUrl -and $_ -notmatch '^https://[a-z0-9-]+(?:\.[a-z0-9-]+)*\.workers\.dev$' })
$workersDevUrls = @($triggerUrls | Where-Object { $_ -match "^https://$([regex]::Escape($WorkerName))\.[a-z0-9-]+(?:\.[a-z0-9-]+)*\.workers\.dev$" })

if ($unexpectedUrls.Count -gt 0) {
  throw "Unexpected route or domain appeared in Wrangler output: $($unexpectedUrls -join ', ')"
}
if ($workersDevUrls.Count -ne 1) {
  throw "Wrangler exited successfully but did not return exactly one expected workers.dev URL."
}

$workersDevUrl = $workersDevUrls[0]
Invoke-NativeChecked -FilePath $nodeExe -ArgumentList @($wranglerCli, "deployments", "status", "--name", $WorkerName, "--json")

$homeStatus = Get-VerifiedHttpStatus -Uri $workersDevUrl
$adminLoginUrl = "$workersDevUrl/admin/login"
$adminLoginStatus = Get-VerifiedHttpStatus -Uri $adminLoginUrl
$publicStatus = Get-VerifiedHttpStatus -Uri $approvedPublicUrl

Write-Host "DEPLOYMENT VERIFIED"
Write-Host "URL=$workersDevUrl"
Write-Host "HOME_HTTP=$homeStatus"
Write-Host "ADMIN_LOGIN_HTTP=$adminLoginStatus"
Write-Host "PUBLIC_HTTP=$publicStatus"
Write-Host "CUSTOM_ROUTE=www.culturagratis.com preserved in generated configuration and Wrangler deployment output"
Write-Host "DNS_CHANGES=none requested; the existing custom-domain route is preserved"
