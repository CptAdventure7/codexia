import { describe, expect, test } from 'bun:test';
import { shouldEnableCodexEvents } from './startupGate';

describe('shouldEnableCodexEvents', () => {
  test('keeps codex events disabled in tauri until codex initialization is complete', () => {
    expect(shouldEnableCodexEvents(true, false)).toBe(false);
  });

  test('enables codex events in tauri after codex initialization completes', () => {
    expect(shouldEnableCodexEvents(true, true)).toBe(true);
  });

  test('always enables codex events in non-tauri runtime', () => {
    expect(shouldEnableCodexEvents(false, false)).toBe(true);
  });
});
