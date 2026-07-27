type SyncJob = {
  execute: () => Promise<void>;
  retries: number;
  maxRetries: number;
  error: string | null;
};

type SyncListener = (status: SyncStatus) => void;

export interface SyncStatus {
  pending: number;
  lastError: string | null;
  isOnline: boolean;
}

class SyncManager {
  private queue = new Map<string, SyncJob>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private isFlushing = false;
  private listeners = new Set<SyncListener>();
  private _lastError: string | null = null;

  readonly INTERVAL = 3000;
  readonly MAX_RETRIES = 3;

  enqueue(key: string, execute: () => Promise<void>) {
    this.queue.set(key, { execute, retries: 0, maxRetries: this.MAX_RETRIES, error: null });
    this.notify();
  }

  remove(key: string) {
    this.queue.delete(key);
    this.notify();
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.flush(), this.INTERVAL);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async flush(): Promise<void> {
    if (this.isFlushing || this.queue.size === 0) return;
    this.isFlushing = true;

    const entries = [...this.queue.entries()];
    for (const [key, job] of entries) {
      if (job.retries > job.maxRetries) {
        this.queue.delete(key);
        continue;
      }
      try {
        await job.execute();
        this.queue.delete(key);
      } catch (err) {
        job.retries++;
        job.error = err instanceof Error ? err.message : String(err);
        this._lastError = job.error;
      }
    }

    this.isFlushing = false;
    this.notify();
  }

  get status(): SyncStatus {
    return {
      pending: this.queue.size,
      lastError: this._lastError,
      isOnline: this.queue.size === 0 && !this._lastError,
    };
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const s = this.status;
    for (const listener of this.listeners) listener(s);
  }
}

export const syncManager = new SyncManager();
