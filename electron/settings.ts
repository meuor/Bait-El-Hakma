import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

export interface DesktopSettings {
  closeToTray: boolean;
  minimizeToTray: boolean;
  autoStart: boolean;
  startMinimized: boolean;
  showNotifications: boolean;
}

const DEFAULT_SETTINGS: DesktopSettings = {
  closeToTray: true,
  minimizeToTray: false,
  autoStart: false,
  startMinimized: false,
  showNotifications: true,
};

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), 'desktop-settings.json');
}

export function loadSettings(): DesktopSettings {
  try {
    const filePath = getSettingsPath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    console.warn('[settings] Failed to load, using defaults');
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: DesktopSettings): void {
  try {
    const filePath = getSettingsPath();
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('[settings] Failed to save:', err);
  }
}

export function applyAutoStart(settings: DesktopSettings): void {
  app.setLoginItemSettings({
    openAtLogin: settings.autoStart,
    openAsHidden: settings.startMinimized,
  });
}
