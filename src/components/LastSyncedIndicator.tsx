import { useEffect, useState } from 'react';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { syncManager } from '@/lib/SyncManager';
import type { AppTab } from '@/types';

function formatAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function LastSyncedIndicator({ tab }: { tab: AppTab }) {
  const { state } = useApp();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const unsub = syncManager.subscribe((status) => setPending(status.pending));
    return unsub;
  }, []);

  const syncedAt = state.lastSynced?.[tab];

  if (pending > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400" title="Syncing to cloud...">
        <Loader2 className="w-3 h-3 animate-spin" />
        Syncing...
      </span>
    );
  }

  if (!syncedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" title="No cloud changes yet">
        <CloudOff className="w-3 h-3" />
        Not synced
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400" title={`Last synced to cloud: ${new Date(syncedAt).toLocaleString()}`}>
      <Cloud className="w-3 h-3" />
      Last synced {formatAgo(syncedAt)}
    </span>
  );
}
