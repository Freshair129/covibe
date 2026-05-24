@echo off
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8989') do (
  taskkill /f /pid %%a
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8787') do (
  taskkill /f /pid %%a
)
