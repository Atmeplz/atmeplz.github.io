@echo off
chcp 65001 >nul
python "%~dp0make_manifest.py"
pause
