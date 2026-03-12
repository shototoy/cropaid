!include "MUI2.nsh"

!define APPNAME "CropAid"
!define EXE_NAME "CropAid.exe"
!define ICON_NAME "icon.ico"
!define ROOT ".."

Name "${APPNAME}"
OutFile "${ROOT}\\release\\${APPNAME}-Setup.exe"
InstallDir "$LOCALAPPDATA\\${APPNAME}"
InstallDirRegKey HKCU "Software\\${APPNAME}" "InstallDir"
RequestExecutionLevel user

!define MUI_ICON "${ROOT}\\release\\icon.ico"
!define MUI_UNICON "${ROOT}\\release\\icon.ico"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "${ROOT}\\release\\CropAid-win32-x64\\*.*"

  WriteRegStr HKCU "Software\\${APPNAME}" "InstallDir" "$INSTDIR"

  CreateShortcut "$DESKTOP\\${APPNAME}.lnk" "$INSTDIR\\${EXE_NAME}" "" "$INSTDIR\\${ICON_NAME}" 0
  CreateDirectory "$SMPROGRAMS\\${APPNAME}"
  CreateShortcut "$SMPROGRAMS\\${APPNAME}\\${APPNAME}.lnk" "$INSTDIR\\${EXE_NAME}" "" "$INSTDIR\\${ICON_NAME}" 0

  WriteUninstaller "$INSTDIR\\Uninstall.exe"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APPNAME}" "DisplayName" "${APPNAME}"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APPNAME}" "UninstallString" "$\"$INSTDIR\\Uninstall.exe$\""
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APPNAME}" "DisplayIcon" "$\"$INSTDIR\\${ICON_NAME}$\""
  WriteRegDWORD HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APPNAME}" "NoModify" 1
  WriteRegDWORD HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APPNAME}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\\${APPNAME}.lnk"
  Delete "$SMPROGRAMS\\${APPNAME}\\${APPNAME}.lnk"
  RMDir "$SMPROGRAMS\\${APPNAME}"

  DeleteRegKey HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APPNAME}"
  DeleteRegKey HKCU "Software\\${APPNAME}"

  RMDir /r "$INSTDIR"
SectionEnd
