@echo off
setlocal enabledelayedexpansion
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "C:\Users\User\Desktop\INVETORY FILE AND SALES\stock_frontend"
if exist dist rmdir /s /q dist
if exist .vite rmdir /s /q .vite
call npm run build
