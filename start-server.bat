<<<<<<< Updated upstream
@echo off
echo ============================================================
echo Weather Dashboard 서버 시작 중...
echo ============================================================
echo.

REM Python이 설치되어 있는지 확인
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python이 발견되었습니다.
    echo [INFO] API 기능이 포함된 서버를 시작합니다...
    echo.
    python server_with_api.py
    goto :end
)

REM Python3 확인
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python 3가 발견되었습니다.
    echo [INFO] API 기능이 포함된 서버를 시작합니다...
    echo.
    python3 server_with_api.py
    goto :end
)

echo [오류] Python이 설치되어 있지 않습니다.
echo.
echo ============================================================
echo 해결 방법:
echo ============================================================
echo.
echo 1. Python 설치:
echo    - https://www.python.org/downloads/ 접속
echo    - "Download Python" 버튼 클릭
echo    - 설치 시 "Add Python to PATH" 체크 필수!
echo.
echo 2. 설치 후:
echo    - 이 파일(start-server.bat)을 다시 실행하세요
echo    - 또는 PowerShell에서: python server_with_api.py
echo.
echo ============================================================
pause
:end

=======
@echo off
echo ============================================================
echo Weather Dashboard 서버 시작 중...
echo ============================================================
echo.

REM Python이 설치되어 있는지 확인
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python이 발견되었습니다.
    echo [INFO] API 기능이 포함된 서버를 시작합니다...
    echo.
    python server_with_api.py
    goto :end
)

REM Python3 확인
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python 3가 발견되었습니다.
    echo [INFO] API 기능이 포함된 서버를 시작합니다...
    echo.
    python3 server_with_api.py
    goto :end
)

echo [오류] Python이 설치되어 있지 않습니다.
echo.
echo ============================================================
echo 해결 방법:
echo ============================================================
echo.
echo 1. Python 설치:
echo    - https://www.python.org/downloads/ 접속
echo    - "Download Python" 버튼 클릭
echo    - 설치 시 "Add Python to PATH" 체크 필수!
echo.
echo 2. 설치 후:
echo    - 이 파일(start-server.bat)을 다시 실행하세요
echo    - 또는 PowerShell에서: python server_with_api.py
echo.
echo ============================================================
pause
:end

>>>>>>> Stashed changes
