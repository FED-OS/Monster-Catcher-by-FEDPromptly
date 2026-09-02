// ============================================================
//  Monster Catcher — Electron Main Process
//  Wraps the HTML5 game in a native desktop window that looks
//  and feels like a Game Boy Advance handheld console.
// ============================================================
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// In headless / CI / virtual-display environments, disable GPU hardware
// acceleration so the renderer falls back to software (SwiftShader).
// On real desktops with a GPU this is a no-op and hardware accel is used.
if (process.env.ELECTRON_DISABLE_GPU || process.argv.includes('--disable-gpu')) {
  app.disableHardwareAcceleration();
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 820,
    height: 620,
    minWidth: 820,
    minHeight: 620,
    resizable: false,
    title: 'Monster Catcher — Verdale Region: GBA Edition',
    backgroundColor: '#1a1a2e',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: !!process.argv.includes('--dev')
    }
  });

  // Remove the default application menu for a clean game look
  Menu.setApplicationMenu(null);

  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
