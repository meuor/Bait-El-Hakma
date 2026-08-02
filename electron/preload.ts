import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,

  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // Window state events
  onMaximized: (callback: (maximized: boolean) => void) => {
    const handler = (_: Electron.IpcRendererEvent, maximized: boolean) => callback(maximized);
    ipcRenderer.on('window-maximized', handler);
    return () => ipcRenderer.removeListener('window-maximized', handler);
  },

  // Desktop settings
  getDesktopSettings: () => ipcRenderer.invoke('get-desktop-settings'),
  setDesktopSettings: (settings: Record<string, unknown>) => ipcRenderer.invoke('set-desktop-settings', settings),
  onDesktopSettingsChanged: (callback: (settings: any) => void) => {
    const handler = (_: any, settings: any) => callback(settings);
    ipcRenderer.on('desktop-settings-changed', handler);
    return () => ipcRenderer.removeListener('desktop-settings-changed', handler);
  },

  // Update system
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getUpdateStatus: () => ipcRenderer.invoke('get-update-status'),
  onUpdateAvailable: (callback: (info: any) => void) => {
    ipcRenderer.on('update-available', (_, info) => callback(info));
  },
  onUpdateNotAvailable: (callback: () => void) => {
    ipcRenderer.on('update-not-available', () => callback());
  },
  onUpdateDownloaded: (callback: (info: any) => void) => {
    ipcRenderer.on('update-downloaded', (_, info) => callback(info));
  },
  onUpdateProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('update-progress', (_, progress) => callback(progress));
  },
  onUpdateError: (callback: (error: string) => void) => {
    ipcRenderer.on('update-error', (_, error) => callback(error));
  },

  // Logging
  getAppLogs: () => ipcRenderer.invoke('get-app-logs'),
  getLogDirectory: () => ipcRenderer.invoke('get-log-directory'),

  // API proxy (main-process fetch — bypasses renderer CORS)
  apiRequest: (url: string, options?: { method?: string; headers?: Record<string, string>; body?: string }) =>
    ipcRenderer.invoke('api-request', url, options),
});
