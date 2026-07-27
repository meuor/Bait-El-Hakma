import { useApp } from '@/context/AppContext';
import { Cloud, CloudOff, Loader2, AlertTriangle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { syncManager, type SyncStatus } from '@/lib/SyncManager';

export function SyncStatus() {
  const { state } = useApp();
  const { apiStatus, syncErrors } = state;
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ pending: 0, lastError: null, isOnline: true });
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasErrors = syncErrors.length > 0;
  const errorMsg = syncStatus.lastError || (syncErrors.length > 0 ? syncErrors[syncErrors.length - 1] : null);

  useEffect(() => {
    const unsub = syncManager.subscribe(setSyncStatus);
    return unsub;
  }, []);

  useEffect(() => {
    if (syncStatus.pending === 0 && !syncStatus.lastError && !hasErrors) {
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), 5000);
    } else {
      setVisible(true);
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [syncStatus.pending, syncStatus.lastError, hasErrors]);

  if (apiStatus === 'checking') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-yellow-500/10 border-t border-yellow-500/20 px-4 py-2 flex items-center justify-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Connecting to cloud...</span>
        </div>
      </div>
    );
  }

  if (apiStatus === 'offline' && !hasErrors && !syncStatus.lastError) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-orange-500/10 border-t border-orange-500/20 px-4 py-2 flex items-center justify-center gap-2 text-sm text-orange-700 dark:text-orange-400">
          <CloudOff className="h-3.5 w-3.5" />
          <span>Data saved locally only. Cloud sync unavailable.</span>
        </div>
      </div>
    );
  }

  if (syncStatus.pending > 0) {
    return (
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="bg-blue-500/10 border-t border-blue-500/20 px-4 py-2 flex items-center justify-center gap-2 text-sm text-blue-700 dark:text-blue-400">
          <Upload className="h-3.5 w-3.5 animate-bounce" />
          <span>Syncing to cloud ({syncStatus.pending} pending)</span>
          <Loader2 className="h-3 w-3 animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (hasErrors || syncStatus.lastError) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="bg-red-500/10 border-t border-red-500/20 px-4 py-2">
            <div className="flex items-center justify-center gap-2 text-sm text-red-700 dark:text-red-400">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Cloud sync failed</span>
              <button
                onClick={() => setExpanded(!expanded)}
                className="underline text-xs ml-1 hover:text-red-900 dark:hover:text-red-300"
              >
                {expanded ? 'Hide' : 'Show details'}
              </button>
            </div>
            {expanded && errorMsg && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-500/5 rounded p-2 max-w-lg mx-auto">
                <p className="font-mono break-all">{errorMsg}</p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (syncStatus.isOnline && visible && !hasErrors) {
    return (
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="bg-green-500/10 border-t border-green-500/20 px-4 py-2 flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-400">
          <Cloud className="h-3.5 w-3.5" />
          <span>All data saved to cloud</span>
        </div>
      </motion.div>
    );
  }

  return null;
}
