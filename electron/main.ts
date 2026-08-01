import { app, BrowserWindow, shell, Tray, Menu, nativeImage, ipcMain, protocol, Notification } from 'electron';
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

const DIST_PATH = path.join(__dirname, '..', 'dist');

// Auto-updater configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.logger = {
  info: (msg: string) => console.log('[updater]', msg),
  warn: (msg: string) => console.warn('[updater]', msg),
  error: (msg: string) => console.error('[updater]', msg),
  debug: () => {},
} as any;

function getIconPath(): string {
  if (!isDev) {
    const resourcesPath = process.resourcesPath;
    const iconPath = path.join(resourcesPath, 'icons', 'icon.png');
    if (fs.existsSync(iconPath)) return iconPath;
  }
  return path.join(__dirname, '..', 'build', 'icon.png');
}

function createWindow() {
  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Bait El-Hakma - House of Wisdom',
    icon: getIconPath(),
    backgroundColor: '#06020f',
    show: !desktopSettings.startMinimized,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
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
    if (!desktopSettings.startMinimized) {
      mainWindow?.show();
    }
    // Check for updates after window is ready (only in production)
    if (!isDev) {
      setTimeout(() => {
        autoUpdater.checkForUpdates().catch(() => {});
      }, 3000);
    }
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting && desktopSettings.closeToTray) {
      event.preventDefault();
      mainWindow?.hide();
      if (desktopSettings.showNotifications && !Notification.isSupported() === false) {
        // Silent minimize — no notification needed
      }
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

  // Send initial settings to renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('desktop-settings-changed', desktopSettings);
  });
}

function createTray() {
  const iconPath = getIconPath();
  const icon = nativeImage.createFromPath(iconPath);
  const trayIconSize = isLinux ? 22 : 16;
  tray = new Tray(icon.resize({ width: trayIconSize, height: trayIconSize }));

  updateTrayMenu();

  tray.setToolTip('Bait El-Hakma - House of Wisdom');

  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
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
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function sendNotification(title: string, body: string) {
  if (!desktopSettings.showNotifications) return;
  if (!Notification.isSupported()) return;

  const notification = new Notification({
    title,
    body,
    icon: getIconPath(),
    silent: true,
  });
  notification.show();
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  mainWindow?.webContents.send('update-status', 'checking');
});

autoUpdater.on('update-available', (info) => {
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
  mainWindow?.webContents.send('update-downloaded', {
    version: info.version,
    releaseDate: info.releaseDate,
  });
  sendNotification(
    'Update Ready',
    `Bait El-Hakma v${info.version} has been downloaded and is ready to install.`
  );
});

autoUpdater.on('error', (error) => {
  mainWindow?.webContents.send('update-error', error.message);
});

// IPC Handlers — Window
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

// IPC Handlers — Desktop Settings
ipcMain.handle('get-desktop-settings', () => {
  return desktopSettings;
});

ipcMain.handle('set-desktop-settings', (_, settings: Partial<DesktopSettings>) => {
  desktopSettings = { ...desktopSettings, ...settings };
  saveSettings(desktopSettings);
  applyAutoStart(desktopSettings);
  updateTrayMenu();

  // Notify renderer
  mainWindow?.webContents.send('desktop-settings-changed', desktopSettings);

  return desktopSettings;
});

// Update IPC handlers
ipcMain.handle('check-for-updates', async () => {
  if (isDev) {
    return { error: 'Updates are not available in development mode' };
  }
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
  return {
    isDev,
    version: app.getVersion(),
    platform: process.platform,
  };
});

// Register custom file protocol for serving local assets in production
function registerFileProtocol() {
  protocol.handle('file', (request) => {
    const url = new URL(request.url);
    let fullPath = decodeURIComponent(url.pathname);

    if (process.platform === 'win32') {
      if (fullPath.startsWith('/') && !fullPath.startsWith('//')) {
        fullPath = fullPath.slice(1);
      }
    }

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return new Response(fs.readFileSync(fullPath), {
        headers: {
          'Content-Type': getMimeType(fullPath),
        },
      });
    }

    // Try resolving relative to DIST_PATH
    const relativePath = path.join(DIST_PATH, url.pathname);
    if (fs.existsSync(relativePath) && fs.statSync(relativePath).isFile()) {
      return new Response(fs.readFileSync(relativePath), {
        headers: {
          'Content-Type': getMimeType(relativePath),
        },
      });
    }

    const indexPath = path.join(DIST_PATH, 'index.html');
    if (fs.existsSync(indexPath)) {
      return new Response(fs.readFileSync(indexPath), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response('Not Found', { status: 404 });
  });
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

app.whenReady().then(() => {
  // Apply auto-start setting
  applyAutoStart(desktopSettings);

  if (!isDev) {
    registerFileProtocol();
  }

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
  app.isQuitting = true;
});
