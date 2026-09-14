Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$devVarsPath = Join-Path $PSScriptRoot ".dev.vars"
if (-not (Test-Path -LiteralPath $devVarsPath -PathType Leaf)) {
  throw "Falta .dev.vars. Cria-o localmente com SUPABASE_SECRET_KEY, sem o adicionar ao Git."
}

$devVars = Get-Content -LiteralPath $devVarsPath -Raw
if ($devVars -notmatch '(?m)^SUPABASE_SECRET_KEY=.+$') {
  throw ".dev.vars não contém SUPABASE_SECRET_KEY."
}

git check-ignore -q -- .dev.vars
if ($LASTEXITCODE -ne 0) {
  throw ".dev.vars não está protegido pelo .gitignore. A prévia foi interrompida."
}

$nodeExe = (Get-Command "node.exe" -ErrorAction Stop).Source
$npmCmd = Join-Path (Split-Path -Parent $nodeExe) "npm.cmd"
$wranglerCli = Join-Path $PSScriptRoot "node_modules/wrangler/bin/wrangler.js"

& $npmCmd test
if ($LASTEXITCODE -ne 0) { throw "A prévia não arrancou porque os testes falharam." }

Write-Host "PRÉVIA PRIVADA: http://127.0.0.1:8787"
Write-Host "A versão integral está aberta apenas neste computador. Para terminar, prime Ctrl+C."
& $nodeExe $wranglerCli "dev" "--local" "--ip" "127.0.0.1" "--port" "8787" "--var" "CGL_PRELAUNCH_MODE:false"
if ($LASTEXITCODE -ne 0) { throw "A prévia local terminou com erro." }
