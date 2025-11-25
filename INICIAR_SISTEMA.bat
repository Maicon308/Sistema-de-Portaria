@echo off
echo ========================================
echo    SISTEMA DE CONTROLE DE PORTARIA
echo ========================================
echo.
echo Iniciando servidores...
echo.

:: Inicia o Backend Django
start "Backend Django" cmd /k "cd backend && python manage.py runserver 0.0.0.0:8000"

:: Aguarda 3 segundos
timeout /t 3 /nobreak >nul

:: Inicia o Frontend React
start "Frontend React" cmd /k "cd frontend && npm run dev -- --host"

echo.
echo ========================================
echo   SERVIDORES INICIADOS!
echo ========================================
echo.
echo Backend:  http://192.168.0.105:8000
echo Frontend: http://192.168.0.105:5173
echo Admin:    http://192.168.0.105:8000/admin
echo.
echo Usuario: admin
echo Senha:   161212
echo.
echo No celular acesse: http://192.168.0.105:5173
echo ========================================
pause
