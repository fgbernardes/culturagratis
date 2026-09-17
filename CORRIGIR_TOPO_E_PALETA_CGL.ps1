Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$cssPath = Join-Path $PSScriptRoot "app\globals.css"
if (-not (Test-Path -LiteralPath $cssPath -PathType Leaf)) {
  throw "Não encontrei app\globals.css. Guarda este ficheiro na pasta principal do repositório culturagratis."
}

$marker = "/* CGL Home: correção topo e paleta */"
$css = Get-Content -LiteralPath $cssPath -Raw
if ($css.Contains($marker)) {
  Write-Host "A correção já está presente em app\globals.css." -ForegroundColor Yellow
  exit 0
}

$rules = @'

/* CGL Home: correção topo e paleta */
.cgl-home { display: flex; flex-direction: column; }
.cgl-home-header { order: -1; position: sticky; top: 0; z-index: 50; }
.cgl-home-event-art { background: var(--sunset); color: var(--charcoal); }
.cgl-home-event-art.photo { background: var(--tejo); color: white; }
.cgl-home-event-art.stage { background: var(--charcoal); color: white; }
.cgl-home-event-art.jazz { background: var(--sun); color: var(--charcoal); }
'@

Add-Content -LiteralPath $cssPath -Value $rules -Encoding utf8
Write-Host "Correção aplicada: topo da Home e paleta dos destaques." -ForegroundColor Green
