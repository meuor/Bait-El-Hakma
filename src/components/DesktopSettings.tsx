import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Monitor, Power, Minimize2, Bell, RotateCcw } from 'lucide-react';

interface DesktopSettings {
  closeToTray: boolean;
  minimizeToTray: boolean;
  autoStart: boolean;
  startMinimized: boolean;
  showNotifications: boolean;
}

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI?.isElectron;

export function DesktopSettingsPanel() {
  const [settings, setSettings] = useState<DesktopSettings>({
    closeToTray: true,
    minimizeToTray: false,
    autoStart: false,
    startMinimized: false,
    showNotifications: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isElectron) {
      setLoading(false);
      return;
    }
    window.electronAPI!.getDesktopSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });

    const unsubscribe = window.electronAPI!.onDesktopSettingsChanged((s: DesktopSettings) => {
      setSettings(s);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const update = async (key: keyof DesktopSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (isElectron) {
      await window.electronAPI!.setDesktopSettings({ [key]: value });
    }
  };

  if (!isElectron) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Monitor className="w-5 h-5 text-primary" />
          Desktop Settings
        </CardTitle>
        <CardDescription>
          Configure how Bait El-Hakma behaves on your desktop
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Close to Tray */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Close to System Tray</span>
            </div>
            <p className="text-xs text-muted-foreground">
              When you close the window, minimize to system tray instead of quitting
            </p>
          </div>
          <Switch
            checked={settings.closeToTray}
            onCheckedChange={(v) => update('closeToTray', v)}
            disabled={loading}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Minimize to Tray */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Minimize2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Minimize to System Tray</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Clicking minimize hides the app to the system tray instead of the taskbar
            </p>
          </div>
          <Switch
            checked={settings.minimizeToTray}
            onCheckedChange={(v) => update('minimizeToTray', v)}
            disabled={loading}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Auto Start */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Start with Windows</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically launch Bait El-Hakma when you log in
            </p>
          </div>
          <Switch
            checked={settings.autoStart}
            onCheckedChange={(v) => update('autoStart', v)}
            disabled={loading}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Start Minimized */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Minimize2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Start Minimized</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Launch minimized to the system tray on startup
            </p>
          </div>
          <Switch
            checked={settings.startMinimized}
            onCheckedChange={(v) => update('startMinimized', v)}
            disabled={loading}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Show Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Desktop Notifications</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Show native notifications for updates and events
            </p>
          </div>
          <Switch
            checked={settings.showNotifications}
            onCheckedChange={(v) => update('showNotifications', v)}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
