import { useApp } from '@/context/AppContext';
import { Cloud, CloudOff, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SyncStatus() {
  const { state } = useApp();
  const { apiStatus, syncErrors } = state;
  const hasErrors = syncErrors.length > 0;

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

  if (apiStatus === 'offline' && !hasErrors) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-orange-500/10 border-t border-orange-500/20 px-4 py-2 flex items-center justify-center gap-2 text-sm text-orange-700 dark:text-orange-400">
          <CloudOff className="h-3.5 w-3.5" />
          <span>Data saved locally only. Cloud sync unavailable.</span>
        </div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="bg-red-500/10 border-t border-red-500/20 px-4 py-2 flex items-center justify-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Cloud sync failed. Retrying... ({syncErrors[syncErrors.length - 1]})</span>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (apiStatus === 'online') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-green-500/10 border-t border-green-500/20 px-4 py-2 flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-400">
          <Cloud className="h-3.5 w-3.5" />
          <span>All data saved to cloud</span>
        </div>
      </div>
    );
  }

  return null;
}
