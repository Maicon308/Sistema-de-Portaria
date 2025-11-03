@echo off
echo ========================================
echo   CONFIGURANDO FIREWALL
echo ========================================
echo.
echo ATENÇÃO: Execute como ADMINISTRADOR!
echo.
pause

echo Liberando porta 8000 (Django Backend)...
netsh advfirewall firewall add rule name="Django Backend - Porta 8000" dir=in action=allow protocol=TCP localport=8000

echo Liberando porta 5173 (React Frontend)...
netsh advfirewall firewall add rule name="React Frontend - Porta 5173" dir=in action=allow protocol=TCP localport=5173

echo.
echo ========================================
echo   FIREWALL CONFIGURADO!
echo ========================================
echo.
echo As portas 8000 e 5173 foram liberadas.
echo Agora você pode acessar de outros dispositivos.
echo.
pause