param(
  [ValidatePattern("^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")]
  [string]$WorkerName = "cgl-independente-teste"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

function Invoke-NativeChecked {
  param([Parameter(Mandatory = $true)][string]$FilePath, [string[]]$ArgumentList = @())
  & $FilePath @ArgumentList
  if ($LASTEXITCODE -ne 0) { throw "Command failed with exit code $LASTEXITCODE: $FilePath $($ArgumentList -join ' ')" }
}

function Get-VerifiedHttpContent {
  param([Parameter(Mandatory = $true)][string]$Uri)
  try {
    return (Invoke-WebRequest -Uri $Uri -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 30).Content
  } catch {
    throw "HTTP content verification failed for ${Uri}: $($_.Exception.Message)"
  }
}

function Get-VerifiedHttpStatus {
  param([Parameter(Mandatory = $true)][string]$Uri, [int]$ExpectedStatus = 200)
  $lastFailure = $null
  for ($attempt = 1; $attempt -le 6; $attempt++) {
    try {
      $response = Invoke-WebRequest -Uri $Uri -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 30
      if ($response.StatusCode -eq $ExpectedStatus) { return [int]$response.StatusCode }
      $lastFailure = "HTTP $($response.StatusCode)"
    } catch {
      $statusCode = if ($null -ne $_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { $null }
      if ($statusCode -eq $ExpectedStatus) { return $statusCode }
      $lastFailure = $_.Exception.Message
    }
    if ($attempt -lt 6) { Start-Sleep -Seconds 3 }
  }
  throw "HTTP verification failed for $Uri: $lastFailure"
}

$configText = Get-Content -LiteralPath "wrangler.jsonc" -Raw
if ($configText -match '"(?:routes?|custom_domain)"\s*:') { throw "Publication interrupted: custom route or domain configuration was found." }
if ($configText -notmatch '"workers_dev"\s*:\s*true') { throw "Publication interrupted: workers_dev must be explicitly true." }
if (Test-Path -LiteralPath ".openai/hosting.json" -PathType Leaf) { throw "Publication interrupted: this package cannot contain ChatGPT Sites configuration." }

$nodeExe = (Get-Command "node.exe" -ErrorAction Stop).Source
$npmCmd = Join-Path (Split-Path -Parent $nodeExe) "npm.cmd"
$wranglerCli = Join-Path $PSScriptRoot "node_modules/wrangler/bin/wrangler.js"
$artifactValidator = Join-Path $PSScriptRoot "scripts/validate-artifact.mjs"

Write-Host "Explicit launch target: $WorkerName on workers.dev"
Invoke-NativeChecked -FilePath $npmCmd -ArgumentList @("ci")
Invoke-NativeChecked -FilePath $npmCmd -ArgumentList @("test")
Invoke-NativeChecked -FilePath $nodeExe -ArgumentList @($artifactValidator)
Invoke-NativeChecked -FilePath $nodeExe -ArgumentList @($wranglerCli, "whoami")

$deployLines = New-Object System.Collections.Generic.List[string]
& $nodeExe $wranglerCli "deploy" "--name" $WorkerName "--var" "CGL_PRELAUNCH_MODE:false" 2>&1 | ForEach-Object {
  $line = $_.ToString(); Write-Host $line; [void]$deployLines.Add($line)
}
if ($LASTEXITCODE -ne 0) { throw "Wrangler launch deploy failed with exit code $LASTEXITCODE." }

$plainDeployText = [regex]::Replace(($deployLines -join "`n"), "$([char]27)\[[0-?]*[ -/]*[@-~]", "")
$triggerUrls = @([regex]::Matches($plainDeployText, '(?m)^\s*(https://[^\s]+)\s*$') | ForEach-Object { $_.Groups[1].Value.TrimEnd('/') })
$unexpectedUrls = @($triggerUrls | Where-Object { $_ -notmatch '^https://[a-z0-9-]+(?:\.[a-z0-9-]+)*\.workers\.dev$' })
$workersDevUrls = @($triggerUrls | Where-Object { $_ -match "^https://$([regex]::Escape($WorkerName))\.[a-z0-9-]+(?:\.[a-z0-9-]+)*\.workers\.dev$" })
if ($unexpectedUrls.Count -gt 0 -or $workersDevUrls.Count -ne 1) { throw "Deployment did not return exactly one expected workers.dev URL." }

$workersDevUrl = $workersDevUrls[0]
$homeStatus = Get-VerifiedHttpStatus -Uri $workersDevUrl
$agendaStatus = Get-VerifiedHttpStatus -Uri "$workersDevUrl/agenda"
$adminLoginStatus = Get-VerifiedHttpStatus -Uri "$workersDevUrl/admin/login"
$homeHtml = Get-VerifiedHttpContent -Uri $workersDevUrl
if ($homeHtml -match '(?i)noindex') { throw "Launch verification failed: Home still declares noindex." }
$robotsText = Get-VerifiedHttpContent -Uri "$workersDevUrl/robots.txt"
if ($robotsText -match '(?im)^\s*Disallow:\s*/\s*
Write-Host "URL=$workersDevUrl"
Write-Host "HOME_HTTP=$homeStatus"
Write-Host "AGENDA_HTTP=$agendaStatus"
Write-Host "ADMIN_LOGIN_HTTP=$adminLoginStatus"
Write-Host "PRELAUNCH_MODE=false for this Worker deployment"
Write-Host "HOME_ROBOTS=noindex not present"
Write-Host "ROBOTS_DISALLOW_ROOT=false"
Write-Host "SITEMAP_HAS_AGENDA=true"
Write-Host "CUSTOM_ROUTES=none in generated configuration and Wrangler deployment output"
Write-Host "DNS_CHANGES=none requested by this deployment"
) { throw "Launch verification failed: robots.txt still blocks the site." }
$sitemapText = Get-VerifiedHttpContent -Uri "$workersDevUrl/sitemap.xml"
if ($sitemapText -notmatch '(?i)/agenda') { throw "Launch verification failed: sitemap.xml does not include Agenda." }

Write-Host "LAUNCH DEPLOYMENT VERIFIED"
Write-Host "URL=$workersDevUrl"
Write-Host "HOME_HTTP=$homeStatus"
Write-Host "AGENDA_HTTP=$agendaStatus"
Write-Host "ADMIN_LOGIN_HTTP=$adminLoginStatus"
Write-Host "PRELAUNCH_MODE=false for this Worker deployment"
Write-Host "CUSTOM_ROUTES=none in generated configuration and Wrangler deployment output"
Write-Host "DNS_CHANGES=none requested by this deployment"
