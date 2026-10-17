@echo off
chcp 65001 >nul
title KhamThong POS (Luxury Gold) - Auto Launcher
echo ===================================================
echo   ✨ กำลังเปิดระบบ KhamThong POS + ลิงก์ออนไลน์...
echo ===================================================
cd /d "%~dp0"
start "KhamThong POS Server" cmd /k "node server.js"
timeout /t 2 >nul
echo.
echo 🌐 กำลังสร้างลิงก์ออนไลน์ (ดูลิงก์ https://....trycloudflare.com ด้านล่าง):
echo.
.\cloudflared.exe tunnel --url http://localhost:3000
pause
