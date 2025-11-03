@echo off
echo ========================================
echo   INICIANDO SISTEMA DE PORTARIA
echo ========================================
echo.

echo [1/2] Iniciando Django Backend...
start "Django Backend" cmd /k "cd /d C:\Users\maico\Desktop\Projeto SETUP - Original\BACKEND && python manage.py runserver 0.0.0.0:8000"
timeout /t 3 /nobreak >nul

echo [2/2] Iniciando React Frontend...
start "React Frontend" cmd /k "cd /d C:\Users\maico\Desktop\Projeto SETUP - Original\FRONTEND && npm run dev -- --host"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   SERVIDORES INICIADOS!
echo ========================================
echo.
echo Acesse de qualquer dispositivo:
echo.
echo Frontend: http://SEU_IP:5173
echo Backend:  http://SEU_IP:8000
echo.
echo (Verifique seu IP com: ipconfig)
echo ========================================
pause