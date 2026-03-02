const MIN_SCOPED_THREAD_LIMIT = 3;

export function getScopedReloadLimit(currentLoadedCount: number): number {
  return Math.max(MIN_SCOPED_THREAD_LIMIT, currentLoadedCount);
}
