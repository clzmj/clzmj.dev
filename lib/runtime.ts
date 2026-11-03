export function bunExecutable(): string {
  const name = process.execPath.replace(/^.*[/\\]/, '');
  if (name === 'bun' || name === 'bun.exe') return process.execPath;
  return 'bun';
}
