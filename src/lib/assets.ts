export function asset(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI?.isElectron;
  if (isElectron) {
    // On app://localhost protocol, relative paths resolve correctly
    // Convert /img/logo.png → ./img/logo.png
    return path.startsWith('/') ? `.${path}` : `./${path}`;
  }
  return path;
}
