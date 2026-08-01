import { app, BrowserWindow, shell, Tray, Menu, nativeImage, ipcMain, protocol } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const DIST_PATH = path.join(__dirname, '..', 'dist');

function getIconPath(): string {
  // In production, icons are in extraResources
  if (!isDev) {
    const resourcesPath = process.resourcesPath;
    const iconPath = path.join(resourcesPath, 'icons', 'icon.png');
    if (fs.existsSync(iconPath)) return iconPath;
  }
  // Fallback to build directory in dev
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
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  };

  // macOS: hidden title bar for native look
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
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
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
}

function createTray() {
  const iconPath = getIconPath();
  const icon = nativeImage.createFromPath(iconPath);

  // Linux needs smaller tray icons
  const trayIconSize = isLinux ? 22 : 16;
  tray = new Tray(icon.resize({ width: trayIconSize, height: trayIconSize }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Bait El-Hakma',
      click: () => mainWindow?.show(),
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

  tray.setToolTip('Bait El-Hakma - House of Wisdom');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow?.show();
  });
}

// IPC Handlers
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
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

// Register custom file protocol for serving local assets in production
function registerFileProtocol() {
  protocol.handle('file', (request) => {
    const filePath = request.url.slice('file://'.length);
    let fullPath = decodeURIComponent(filePath);

    // On Windows, file URLs look like file:///C:/path/to/file
    // On Linux/Mac, they look like file:///path/to/file
    if (process.platform === 'win32') {
      // Remove leading slash for Windows paths
      if (fullPath.startsWith('/') && !fullPath.startsWith('//')) {
        fullPath = fullPath.slice(1);
      }
    }

    // Check if the file exists
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return new Response(fs.readFileSync(fullPath), {
        headers: {
          'Content-Type': getMimeType(fullPath),
        },
      });
    }

    // If file doesn't exist, serve index.html for SPA routing
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
