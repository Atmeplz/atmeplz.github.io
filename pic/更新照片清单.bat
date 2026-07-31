@echo off
chcp 65001 >nul
python "%~dp0make_manifest.py"
python "%~dp0prepare_more.py"
pause
