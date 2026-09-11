@echo off
setlocal enabledelayedexpansion
SET PATH=C:\Program Files\nodejs;%PATH%
cd /d "C:\Users\User\Desktop\INVETORY FILE AND SALES\stock_frontend"
call npm run build
pause
