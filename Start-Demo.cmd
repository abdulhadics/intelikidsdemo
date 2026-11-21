@echo off
setlocal
cd /d "%~dp0"
if /i "%~1"=="rehearsal" set "DATABASE_FILENAME=.tmp/rehearsal.db"
call npm.cmd exec --offline --yes --package=node@20.19.6 -- node demo.cjs
if errorlevel 1 pause
