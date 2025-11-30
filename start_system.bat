@echo off
echo ============================================
echo    INICIANDO SISTEMA SEMDE - FASTAPI
echo ============================================

echo.
echo 1. Iniciando servidor FastAPI...
echo    URL: http://localhost:8000
echo    Docs: http://localhost:8000/docs
echo.

start cmd /k "cd /d C:\Users\basto\Downloads\TakeOff\SEMDE && python main.py"

echo.
echo 2. Aguardando 5 segundos para o servidor iniciar...
timeout /t 5

echo.
echo 3. Servidor deve estar rodando agora!
echo.
echo 4. Para testar a conexao, abra um NOVO terminal e execute:
echo    python test_connection.py
echo.
echo 5. Para usar o sistema, acesse:
echo    - API: http://localhost:8000
echo    - Documentacao: http://localhost:8000/docs
echo.

pause