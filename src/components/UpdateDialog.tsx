import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download, RefreshCw, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}

interface UpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      platform: string;
      getVersion: () => Promise<string>;
      checkForUpdates: () => Promise<{ updateInfo?: UpdateInfo; error?: string }>;
      downloadUpdate: () => Promise<{ success?: boolean; error?: string }>;
      installUpdate: () => void;
      onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void;
      onUpdateNotAvailable: (callback: () => void) => void;
      onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void;
      onUpdateProgress: (callback: (progress: { percent: number }) => void) => void;
      onUpdateError: (callback: (error: string) => void) => void;
    };
  }
}

export function UpdateDialog({ open, onOpenChange }: UpdateDialogProps) {
  const [currentVersion, setCurrentVersion] = useState('');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'latest'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const api = window.electronAPI;

  useEffect(() => {
    if (api) {
      api.getVersion().then(setCurrentVersion);
    }
  }, [api]);

  const checkForUpdates = useCallback(async () => {
    if (!api) return;
    setStatus('checking');
    setError('');
    try {
      const result = await api.checkForUpdates();
      if (result.error) {
        setError(result.error);
        setStatus('error');
      } else if (result.updateInfo) {
        setUpdateInfo(result.updateInfo);
        setStatus('available');
      } else {
        setStatus('latest');
      }
    } catch {
      setError('Failed to check for updates');
      setStatus('error');
    }
  }, [api]);

  const downloadUpdate = useCallback(async () => {
    if (!api) return;
    setStatus('downloading');
    try {
      const result = await api.downloadUpdate();
      if (result.error) {
        setError(result.error);
        setStatus('error');
      }
    } catch {
      setError('Failed to download update');
      setStatus('error');
    }
  }, [api]);

  const installUpdate = useCallback(() => {
    if (!api) return;
    api.installUpdate();
  }, [api]);

  useEffect(() => {
    if (!api || !open) return;

    api.onUpdateAvailable((info) => {
      setUpdateInfo(info);
      setStatus('available');
    });

    api.onUpdateNotAvailable(() => {
      setStatus('latest');
    });

    api.onUpdateDownloaded((info) => {
      setUpdateInfo(info);
      setStatus('downloaded');
    });

    api.onUpdateProgress((p) => {
      setProgress(p.percent);
    });

    api.onUpdateError((err) => {
      setError(err);
      setStatus('error');
    });
  }, [api, open]);

  useEffect(() => {
    if (open && status === 'idle') {
      checkForUpdates();
    }
  }, [open, status, checkForUpdates]);

  if (!api) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full max-w-md rounded-2xl border overflow-hidden"
            style={{
              background: 'rgba(7, 3, 18, 0.95)',
              borderColor: 'rgba(139, 92, 246, 0.15)',
              boxShadow: '0 32px 100px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Updates</h2>
                  <p className="text-xs" style={{ color: '#6b6380' }}>Current: v{currentVersion}</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: '#6b6380' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#a78bfa'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b6380'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pb-5">
              {status === 'checking' && (
                <div className="text-center py-8">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: '#a78bfa' }} />
                  <p className="text-sm" style={{ color: '#8b82a0' }}>Checking for updates...</p>
                </div>
              )}

              {status === 'latest' && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(52, 211, 153, 0.1)' }}>
                    <CheckCircle2 className="h-8 w-8" style={{ color: '#34d399' }} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">You're up to date!</h3>
                  <p className="text-sm" style={{ color: '#6b6380' }}>Version {currentVersion} is the latest release.</p>
                </div>
              )}

              {status === 'available' && updateInfo && (
                <div className="py-4">
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl"
                    style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.12)' }}>
                    <Download className="h-5 w-5" style={{ color: '#a78bfa' }} />
                    <div>
                      <p className="text-sm font-semibold text-white">Update Available</p>
                      <p className="text-xs" style={{ color: '#6b6380' }}>
                        v{updateInfo.version} • {updateInfo.releaseDate ? new Date(updateInfo.releaseDate).toLocaleDateString() : 'Recently released'}
                      </p>
                    </div>
                  </div>

                  {updateInfo.releaseNotes && (
                    <div className="mb-4 p-3 rounded-xl text-sm max-h-40 overflow-y-auto"
                      style={{ background: 'rgba(18, 8, 42, 0.4)', border: '1px solid rgba(139, 92, 246, 0.06)', color: '#8b82a0' }}>
                      <p className="whitespace-pre-wrap">{updateInfo.releaseNotes}</p>
                    </div>
                  )}

                  <Button
                    onClick={downloadUpdate}
                    className="w-full"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Update
                  </Button>
                </div>
              )}

              {status === 'downloading' && (
                <div className="py-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#a78bfa' }} />
                    <p className="text-sm text-white">Downloading update...</p>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden mb-2"
                    style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #8b5cf6, #6366f1)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-right" style={{ color: '#6b6380' }}>{Math.round(progress)}%</p>
                </div>
              )}

              {status === 'downloaded' && updateInfo && (
                <div className="py-4 text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(52, 211, 153, 0.1)' }}>
                    <CheckCircle2 className="h-8 w-8" style={{ color: '#34d399' }} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">Download Complete</h3>
                  <p className="text-sm mb-4" style={{ color: '#6b6380' }}>
                    v{updateInfo.version} is ready to install. The app will restart.
                  </p>
                  <Button
                    onClick={installUpdate}
                    className="w-full"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart & Install
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                    <AlertCircle className="h-8 w-8" style={{ color: '#f87171' }} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">Update Error</h3>
                  <p className="text-sm mb-4" style={{ color: '#6b6380' }}>{error || 'Something went wrong'}</p>
                  <Button
                    onClick={checkForUpdates}
                    variant="ghost"
                    className="text-sm"
                    style={{ color: '#a78bfa' }}
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Links */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-3"
                style={{ borderTop: '1px solid rgba(139, 92, 246, 0.06)' }}>
                <button
                  onClick={() => {
                    window.open('https://github.com/meuor/Bait-El-Hakma/releases', '_blank');
                  }}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: '#5a5270' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#a78bfa'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#5a5270'}
                >
                  <ExternalLink className="w-3 h-3" />
                  Release Notes
                </button>
                <button
                  onClick={checkForUpdates}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: '#5a5270' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#a78bfa'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#5a5270'}
                >
                  <RefreshCw className="w-3 h-3" />
                  Check Again
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
