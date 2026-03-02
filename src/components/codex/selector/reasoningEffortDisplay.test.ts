import { describe, expect, test } from 'bun:test';
import {
  getReasoningEffortDisplay,
  getReasoningEffortTriggerLabel,
} from './reasoningEffortDisplay';

describe('getReasoningEffortDisplay', () => {
  test('returns only the one-word reasoning effort level', () => {
    expect(
      getReasoningEffortDisplay({
        reasoningEffort: 'high',
        description: 'Highest quality but slower responses',
      }),
    ).toBe('high');
  });

  test('returns only one-word level for trigger label', () => {
    expect(getReasoningEffortTriggerLabel('medium')).toBe('medium');
  });
});
