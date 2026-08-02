export function asset(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI?.isElectron;
  if (isElectron) {
    // Resolve relative paths against the page's file:// URL
    // /img/logo.png → file:///C:/path/dist/img/logo.png
    const base = window.location.href.replace(/\/[^/]*$/, '/');
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    try {
      return new URL(cleanPath, base).href;
    } catch {
      return path;
    }
  }
  return path;
}
