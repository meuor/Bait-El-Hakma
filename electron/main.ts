import { app, BrowserWindow, shell, Tray, Menu, nativeImage, ipcMain, Notification, crashReporter, net } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { autoUpdater } from 'electron-updater';
import { loadSettings, saveSettings, applyAutoStart, type DesktopSettings } from './settings';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let desktopSettings: DesktopSettings = loadSettings();
let isQuitting = false;

const DIST_PATH = path.join(__dirname, '..', 'dist');

// --- Error Logging ---
function getLogDir(): string {
  const logDir = path.join(app.getPath('userData'), 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  return logDir;
}

function writeLog(level: string, source: string, message: string, stack?: string) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] [${source}] ${message}${stack ? '\n' + stack : ''}\n`;
  const logFile = path.join(getLogDir(), `app-${new Date().toISOString().slice(0, 10)}.log`);
  try {
    fs.appendFileSync(logFile, logLine, 'utf-8');
  } catch {}
  console[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'](`[${source}] ${message}`);
}

process.on('uncaughtException', (error) => {
  writeLog('ERROR', 'main-process', 'Uncaught exception', error.stack || error.message);
});

process.on('unhandledRejection', (reason) => {
  writeLog('ERROR', 'main-process', 'Unhandled promise rejection', String(reason));
});

// --- Icon ---
function getIconPath(): string {
  if (!isDev) {
    const resourcesPath = process.resourcesPath;
    const candidates = [
      path.join(resourcesPath, 'icons', 'icon.png'),
      path.join(resourcesPath, 'icon.png'),
    ];
    for (const iconPath of candidates) {
      if (fs.existsSync(iconPath)) return iconPath;
    }
  }
  return path.join(__dirname, '..', 'build', 'icon.png');
}

// --- Auto-updater ---
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.logger = {
  info: (msg: string) => writeLog('INFO', 'updater', msg),
  warn: (msg: string) => writeLog('WARN', 'updater', msg),
  error: (msg: string) => writeLog('ERROR', 'updater', msg),
  debug: () => {},
} as any;

// --- Window ---
function createWindow() {
  const iconPath = getIconPath();
  const preloadPath = fs.existsSync(path.join(__dirname, 'preload.mjs'))
    ? path.join(__dirname, 'preload.mjs')
    : path.join(__dirname, 'preload.js');

  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Bait El-Hakma - House of Wisdom',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#06020f',
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
      devtools: isDev,
      webSecurity: false,
    },
  };

  if (isMac) {
    windowOptions.titleBarStyle = 'hiddenInset';
    windowOptions.trafficLightPosition = { x: 15, y: 15 };
    windowOptions.titleBarOverlay = {
      color: '#06020f',
      symbolColor: '#a78bfa',
      height: 40,
    };
  }

  mainWindow = new BrowserWindow(windowOptions);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev && VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(DIST_PATH, 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    writeLog('INFO', 'app', 'Window ready to show');
    if (!desktopSettings.startMinimized) {
      mainWindow?.show();
    }
    if (!isDev) {
      setTimeout(() => {
        autoUpdater.checkForUpdates().catch((err) => {
          writeLog('WARN', 'updater', 'Auto-update check failed', err?.message);
        });
      }, 5000);
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('desktop-settings-changed', desktopSettings);
  });

  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    writeLog('ERROR', 'webcontents', `Page load failed: ${errorCode} - ${errorDescription}`);
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting && desktopSettings.closeToTray) {
      event.preventDefault();
      mainWindow?.hide();
      return;
    }
    mainWindow = null;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximized', false);
  });

  mainWindow.webContents.on('render-process-gone', (_, details) => {
    writeLog('ERROR', 'renderer', `Render process crashed: ${details.reason}`, details.exitCode?.toString());
  });

  mainWindow.on('unresponsive', () => {
    writeLog('WARN', 'app', 'Window became unresponsive');
  });

  mainWindow.on('responsive', () => {
    writeLog('INFO', 'app', 'Window became responsive again');
  });
}

// --- Tray ---
function createTray() {
  try {
    const iconPath = getIconPath();
    if (!fs.existsSync(iconPath)) {
      writeLog('WARN', 'tray', `Icon not found: ${iconPath}, skipping tray`);
      return;
    }
    const icon = nativeImage.createFromPath(iconPath);
    const trayIconSize = isLinux ? 22 : 16;
    tray = new Tray(icon.resize({ width: trayIconSize, height: trayIconSize }));
    tray.setToolTip('Bait El-Hakma - House of Wisdom');

    tray.on('double-click', () => {
      mainWindow?.show();
      mainWindow?.focus();
    });

    updateTrayMenu();
    writeLog('INFO', 'tray', 'System tray created');
  } catch (err) {
    writeLog('WARN', 'tray', 'Failed to create tray', String(err));
  }
}

function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Bait El-Hakma',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Close to Tray',
      type: 'checkbox',
      checked: desktopSettings.closeToTray,
      click: (menuItem) => {
        desktopSettings.closeToTray = menuItem.checked;
        saveSettings(desktopSettings);
        updateTrayMenu();
      },
    },
    {
      label: 'Minimize to Tray',
      type: 'checkbox',
      checked: desktopSettings.minimizeToTray,
      click: (menuItem) => {
        desktopSettings.minimizeToTray = menuItem.checked;
        saveSettings(desktopSettings);
        updateTrayMenu();
      },
    },
    {
      label: 'Start with Windows',
      type: 'checkbox',
      checked: desktopSettings.autoStart,
      click: (menuItem) => {
        desktopSettings.autoStart = menuItem.checked;
        saveSettings(desktopSettings);
        applyAutoStart(desktopSettings);
        updateTrayMenu();
      },
    },
    { type: 'separator' },
    {
      label: 'Check for Updates...',
      click: () => {
        mainWindow?.show();
        autoUpdater.checkForUpdates().catch(() => {});
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function sendNotification(title: string, body: string) {
  if (!desktopSettings.showNotifications) return;
  if (!Notification.isSupported()) return;

  try {
    const notification = new Notification({ title, body, icon: getIconPath(), silent: true });
    notification.show();
  } catch (err) {
    writeLog('WARN', 'notification', 'Failed to show notification', String(err));
  }
}

// --- Auto-updater events ---
autoUpdater.on('checking-for-update', () => {
  mainWindow?.webContents.send('update-status', 'checking');
});

autoUpdater.on('update-available', (info) => {
  writeLog('INFO', 'updater', `Update available: v${info.version}`);
  mainWindow?.webContents.send('update-available', {
    version: info.version,
    releaseDate: info.releaseDate,
    releaseNotes: info.releaseNotes,
  });
});

autoUpdater.on('update-not-available', () => {
  mainWindow?.webContents.send('update-not-available');
});

autoUpdater.on('download-progress', (progress) => {
  mainWindow?.webContents.send('update-progress', {
    percent: progress.percent,
    transferred: progress.transferred,
    total: progress.total,
  });
});

autoUpdater.on('update-downloaded', (info) => {
  writeLog('INFO', 'updater', `Update downloaded: v${info.version}`);
  mainWindow?.webContents.send('update-downloaded', {
    version: info.version,
    releaseDate: info.releaseDate,
  });
  sendNotification('Update Ready', `Bait El-Hakma v${info.version} has been downloaded and is ready to install.`);
});

autoUpdater.on('error', (error) => {
  writeLog('ERROR', 'updater', 'Update error', error.message);
  mainWindow?.webContents.send('update-error', error.message);
});

// --- IPC Handlers — Window ---
ipcMain.on('window-minimize', () => {
  if (desktopSettings.minimizeToTray) {
    mainWindow?.hide();
  } else {
    mainWindow?.minimize();
  }
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized() ?? false;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

// --- IPC — API proxy (main-process fetch, bypasses renderer CORS) ---
ipcMain.handle('api-request', async (_, url: string, options?: { method?: string; headers?: Record<string, string>; body?: string }) => {
  try {
    const fullUrl = url.startsWith('http') ? url : `https://bait-el-hakma.vercel.app${url.startsWith('/') ? url : `/${url}`}`;
    const res = await net.fetch(fullUrl, {
      method: options?.method || 'GET',
      headers: options?.headers,
      body: options?.body,
    });
    const text = await res.text();
    return { status: res.status, statusText: res.statusText, body: text };
  } catch (err) {
    return { status: 0, statusText: 'Failed to fetch', body: '', error: err instanceof Error ? err.message : String(err) };
  }
});

// --- IPC Handlers — Desktop Settings ---
ipcMain.handle('get-desktop-settings', () => {
  return desktopSettings;
});

ipcMain.handle('set-desktop-settings', (_, settings: Partial<DesktopSettings>) => {
  desktopSettings = { ...desktopSettings, ...settings };
  saveSettings(desktopSettings);
  applyAutoStart(desktopSettings);
  updateTrayMenu();
  mainWindow?.webContents.send('desktop-settings-changed', desktopSettings);
  return desktopSettings;
});

// --- IPC — Logs ---
ipcMain.handle('get-app-logs', () => {
  const logDir = getLogDir();
  try {
    const files = fs.readdirSync(logDir).filter(f => f.endsWith('.log')).sort().reverse();
    const latestFile = files[0];
    if (!latestFile) return '';
    return fs.readFileSync(path.join(logDir, latestFile), 'utf-8');
  } catch {
    return '';
  }
});

ipcMain.handle('get-log-directory', () => {
  return getLogDir();
});

// --- IPC — Update ---
ipcMain.handle('check-for-updates', async () => {
  if (isDev) return { error: 'Updates are not available in development mode' };
  try {
    const result = await autoUpdater.checkForUpdates();
    return {
      updateInfo: result?.updateInfo ? {
        version: result.updateInfo.version,
        releaseDate: result.updateInfo.releaseDate,
        releaseNotes: result.updateInfo.releaseNotes,
      } : null,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to check for updates' };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to download update' };
  }
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('get-update-status', () => {
  return { isDev, version: app.getVersion(), platform: process.platform };
});

// --- App Lifecycle ---
app.whenReady().then(() => {
  writeLog('INFO', 'app', `App starting v${app.getVersion()} (${isDev ? 'dev' : 'prod'})`);
  applyAutoStart(desktopSettings);
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  writeLog('INFO', 'app', 'App quitting');
});
