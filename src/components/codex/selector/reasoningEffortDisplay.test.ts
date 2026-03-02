import { describe, expect, test } from 'bun:test';
import { getReasoningEffortDisplay } from './reasoningEffortDisplay';

describe('getReasoningEffortDisplay', () => {
  test('returns only the one-word reasoning effort level', () => {
    expect(
      getReasoningEffortDisplay({
        reasoningEffort: 'high',
        description: 'Highest quality but slower responses',
      }),
    ).toBe('high');
  });
});
