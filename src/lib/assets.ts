const isElectronEnv = typeof window !== 'undefined' && !!(window as any).electronAPI?.isElectron;
const assetBase = isElectronEnv ? '.' : '';

export function asset(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return `${assetBase}${path}`;
}
