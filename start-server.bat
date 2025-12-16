@echo off
echo Weather Dashboard 서버 시작 중...
echo.

REM Python이 설치되어 있는지 확인
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python이 발견되었습니다. Python 서버를 시작합니다...
    python server.py
    goto :end
)

REM Node.js가 설치되어 있는지 확인
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Node.js가 발견되었습니다. Node.js 서버를 시작합니다...
    node server.js
    goto :end
)

echo 오류: Python 또는 Node.js가 설치되어 있지 않습니다.
echo.
echo 다음 중 하나를 설치해주세요:
echo 1. Python 3: https://www.python.org/downloads/
echo 2. Node.js: https://nodejs.org/
echo.
echo 또는 index.html 파일을 직접 브라우저로 여는 것을 권장하지 않습니다.
echo (CORS 오류가 발생할 수 있습니다)
echo.
pause
:end

