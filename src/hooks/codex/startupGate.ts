export function shouldEnableCodexEvents(isTauriRuntime: boolean, codexReady: boolean): boolean {
  if (!isTauriRuntime) {
    return true;
  }
  return codexReady;
}
