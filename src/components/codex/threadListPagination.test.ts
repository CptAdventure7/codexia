import { describe, expect, test } from 'bun:test';
import { getScopedReloadLimit } from './threadListPagination';

describe('getScopedReloadLimit', () => {
  test('keeps default minimum of 3 when no scoped threads are loaded yet', () => {
    expect(getScopedReloadLimit(0)).toBe(3);
  });

  test('preserves current scoped list size after load more', () => {
    expect(getScopedReloadLimit(23)).toBe(23);
  });

  test('never drops below minimum when count is less than 3', () => {
    expect(getScopedReloadLimit(2)).toBe(3);
  });
});
