@echo off
REM ==============================================================
REM Núi Xanh Badminton - Docker Database Management Script
REM ==============================================================

if "%1"=="down" goto stop
if "%1"=="stop" goto stop
if "%1"=="logs" goto logs
if "%1"=="reset" goto reset

:start
echo [INFO] Dang khoi dong MySQL 8.0 bang Docker tren cong 3308...
wsl docker compose up -d
echo.
echo ==============================================================
echo [THANH CONG] Database Docker da san sang!
echo - Hostname / IP:   127.0.0.1 (hoac localhost)
echo - MySQL Port:      3308
echo - User:            root
echo - Password:        root
echo - Database Name:   badminton_shop
echo - Ket noi truc tiep bang HeidiSQL cong 3308 hoan toan san sang!
echo ==============================================================
goto end

:stop
echo [INFO] Dang dung Database Docker...
wsl docker compose down
echo [THANH CONG] Da dung Database Docker.
goto end

:logs
echo [INFO] Theo doi logs MySQL Container...
wsl docker compose logs -f badminton_db
goto end

:reset
echo [CANH BAO] Dang khoi tao lai Database ve trang thai ban dau...
wsl docker compose down -v
wsl docker compose up -d
echo [THANH CONG] Da reset toan bo database sach voi schema va seed mau!
goto end

:end
