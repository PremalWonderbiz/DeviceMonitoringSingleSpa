@echo off
cd /d %~dp0

wt ^
  new-tab -d .\rootmfe cmd /k "npm run start" ^
  ; new-tab -d .\dashboardMfe cmd /k "npm run start:standalone" ^
  ; new-tab -d .\propertyPanelMfe cmd /k "npm run start:standalone" ^
  ; new-tab -d .\alarmPanelMfe cmd /k "npm run start:standalone"
