const { app, BrowserWindow, shell } = require('electron');
const fs = require('fs');
const path = require('path');

function resolveWindowIconPath() {
  // Prefer a real file on disk for maximum compatibility (asar paths can be finicky for some consumers).
  const devIcon = path.join(process.cwd(), 'icon.ico');
  const packagedIcon = path.join(app.getAppPath(), 'icon.ico'); // typically .../resources/app.asar/icon.ico
  const source = app.isPackaged ? packagedIcon : devIcon;

  if (!fs.existsSync(source)) return undefined;
  if (!app.isPackaged) return source;

  const dest = path.join(app.getPath('userData'), 'icon.ico');
  try {
    if (!fs.existsSync(dest)) fs.copyFileSync(source, dest);
    return dest;
  } catch {
    return undefined;
  }
}

function createMainWindow() {
  const iconPath = resolveWindowIconPath();
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#ffffff',
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Open external links in the user's default browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  const startUrl = process.env.ELECTRON_START_URL;
  if (!app.isPackaged && startUrl) {
    win.loadURL(startUrl);
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  // Recommended on Windows for proper notifications/taskbar grouping.
  app.setAppUserModelId('com.cropaid.desktop');

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
