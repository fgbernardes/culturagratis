@echo off
setlocal
title CGL - Publicacao workers.dev

cd /d "%~dp0"
if not exist ".\PUBLICAR_WORKERS_DEV.ps1" (
  echo ERRO: PUBLICAR_WORKERS_DEV.ps1 nao foi encontrado nesta pasta.
  echo Extraia primeiro todo o conteudo do ZIP para uma pasta nova.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\PUBLICAR_WORKERS_DEV.ps1"
set "CGL_EXIT=%ERRORLEVEL%"

echo.
if "%CGL_EXIT%"=="0" (
  echo Processo terminado com codigo zero.
) else (
  echo Processo interrompido com o codigo %CGL_EXIT%.
)
echo Esta janela ficara aberta para o resultado poder ser verificado.
pause
exit /b %CGL_EXIT%
